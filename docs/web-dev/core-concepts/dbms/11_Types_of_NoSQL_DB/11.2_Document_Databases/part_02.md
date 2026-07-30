---
sidebar_label: Document Data Modeling
sidebar_position: 1
---

# Document Data Modeling

## 1. Introduction

In last section, we learned the fundamentals of document databases, including documents, collections, BSON, flexible schemas, and MongoDB basics.

Now we will focus on one of the most important skills when working with MongoDB:

**How should we design documents and relationships for a real-world application?**

A document database gives us flexibility, but flexibility does not automatically produce a good data model.

Poor document design can lead to:

- Large documents.
- Excessive data duplication.
- Difficult updates.
- Expensive queries.
- Unbounded arrays.
- Data inconsistency.
- Complicated application logic.
- Poor performance as the application grows.

In relational databases, we commonly think about tables, foreign keys, normalization, and JOINs.

In document databases, we must think carefully about:

1. How the application accesses data.
2. Which information should be stored together.
3. Which information should be stored separately.
4. How frequently related data changes.
5. How large documents can become.
6. How relationships should be represented.

The central principle is:

**Design documents around application access patterns and data lifecycle, not simply around real-world entities.**

---

## 2. Understanding Document Data Modeling

Data modeling is the process of deciding how information should be structured and stored in a database.

Consider an e-commerce application.

We have these entities:

```text
Users
Products
Orders
Payments
Addresses
```

A relational database might represent them using separate tables.

A document database can represent them using separate collections, embedded documents, references, or a combination of these approaches.

For example, a user document could look like:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  }
}
```

An order document could look like:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500,
  "status": "delivered"
}
```

Notice that the order contains a reference to the user rather than the complete user document.

Why?

Because we need to decide whether the user information should be embedded or referenced.

That is the core of document data modeling.

---

## 3. Two Fundamental Modeling Approaches

There are two major ways to represent related data in document databases:

1. Embedding.
2. Referencing.

### 3.1 Embedding

Embedding means storing related information inside the same document.

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  }
}
```

Here, the address is embedded inside the user document.

Visual representation:

```text
users collection
       |
       v
+-------------------------+
| User Document           |
|                         |
| _id: 101                |
| name: Rahul             |
| email: rahul@example... |
|                         |
| address:                |
|   city: Noida           |
|   state: Uttar Pradesh  |
+-------------------------+
```

The user and address are stored together.

### 3.2 Referencing

Referencing means storing related information in separate documents and connecting them through identifiers.

Users collection:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "addressId": 501
}
```

Addresses collection:

```json
{
  "_id": 501,
  "city": "Noida",
  "state": "Uttar Pradesh"
}
```

Visual representation:

```text
users collection              addresses collection
+------------------+          +----------------------+
| _id: 101         |          | _id: 501             |
| name: Rahul      |          | city: Noida          |
| addressId: 501   |--------->| state: Uttar Pradesh |
+------------------+          +----------------------+
```

The user document stores the address identifier.

### 3.3 Embedding vs Referencing

| Feature          | Embedding                   | Referencing                               |
| ---------------- | --------------------------- | ----------------------------------------- |
| Storage          | Same document               | Separate documents                        |
| Retrieval        | Often one query             | May require multiple queries              |
| Data duplication | Can increase                | Usually lower                             |
| Document size    | Can grow                    | Individual documents remain smaller       |
| Updates          | Convenient for related data | Better for independently managed data     |
| Atomicity        | Single-document atomicity   | Cross-document coordination may be needed |
| Relationships    | Parent-child structure      | Identifier-based relationship             |
| Best suited for  | Data accessed together      | Data managed independently or shared      |

Neither approach is universally better.

The correct decision depends on the application's access patterns, update patterns, data size, and consistency requirements.

---

## 4. One-to-One Relationships

A one-to-one relationship means one entity is associated with one other entity.

Example:

```text
User → Profile
```

A user has one profile.

### 4.1 Option A: Embed the profile

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "profile": {
    "bio": "Backend Developer",
    "website": "example.com",
    "location": "Noida"
  }
}
```

Advantages:

- User and profile can be retrieved together.
- No separate query is needed.
- Updating fields in the same document is straightforward.
- Single-document operations are atomic.

This is a good choice when profile information is small and usually accessed with the user.

### 4.2 Option B: Reference the profile

Users collection:

```json
{
  "_id": 101,
  "name": "Rahul",
  "profileId": 501
}
```

Profiles collection:

```json
{
  "_id": 501,
  "bio": "Backend Developer",
  "website": "example.com",
  "location": "Noida"
}
```

Advantages:

- Profile can have an independent lifecycle.
- Large profile information does not increase the user document.
- Different application workflows can access profiles independently.

### 4.3 Which approach should we choose?

| Requirement                               | Suitable approach                      |
| ----------------------------------------- | -------------------------------------- |
| Small profile, always retrieved with user | Embedding                              |
| Large profile with independent updates    | Referencing                            |
| Profile shared by multiple users          | Referencing, if sharing is intentional |
| User and profile have the same lifecycle  | Embedding is often suitable            |

**Rule:** For a simple one-to-one relationship, embedding is often convenient, but independent lifecycle and access requirements can justify referencing.

---

## 5. One-to-Many Relationships

A one-to-many relationship means one parent entity can be associated with multiple child entities.

Examples:

```text
User → Orders
User → Addresses
Product → Reviews
Department → Employees
```

Consider:

```text
User 101
   |
   +---- Order 5001
   |
   +---- Order 5002
   |
   +---- Order 5003
```

There are multiple ways to model this relationship.

### 5.1 Option A: Embed the child documents

```json
{
  "_id": 101,
  "name": "Rahul",
  "orders": [
    {
      "orderId": 5001,
      "total": 2500,
      "status": "delivered"
    },
    {
      "orderId": 5002,
      "total": 1500,
      "status": "pending"
    }
  ]
}
```

Advantages:

- User and orders can be retrieved together.
- Convenient for small, bounded collections of child data.
- Single-document updates can be atomic.

Disadvantages:

- User document grows as orders increase.
- Updating individual orders can become more expensive.
- Orders may have an independent lifecycle.
- Unbounded arrays can cause serious problems.

### 5.2 Option B: Reference the parent from child documents

Users collection:

```json
{
  "_id": 101,
  "name": "Rahul"
}
```

Orders collection:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500,
  "status": "delivered"
}
```

Another order:

```json
{
  "_id": 5002,
  "userId": 101,
  "total": 1500,
  "status": "pending"
}
```

Here, every order stores the user's identifier.

Query orders:

```javascript
db.orders.find({
  userId: 101,
});
```

Advantages:

- Orders can grow independently.
- Each order has its own document.
- Easier to paginate orders.
- Orders can be updated independently.
- User documents remain small.

### 5.3 Option C: Store child IDs inside the parent

Users collection:

```json
{
  "_id": 101,
  "name": "Rahul",
  "orderIds": [5001, 5002, 5003]
}
```

Orders collection:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500
}
```

This provides a reference from the parent to its children.

However, maintaining both `orderIds` and `userId` introduces duplicated relationship information.

If the order is deleted or reassigned, both sides may need updating.

Do not maintain redundant references without a clear reason.

### 5.4 Comparison

| Approach                | Advantages                                 | Disadvantages                                    |
| ----------------------- | ------------------------------------------ | ------------------------------------------------ |
| Embed children          | Fast combined retrieval                    | Parent document can grow                         |
| Child references parent | Independent child lifecycle and pagination | Parent-child retrieval may need multiple queries |
| Parent stores child IDs | Convenient access to child identifiers     | Relationship metadata must be maintained         |

### 5.5 Which approach should we choose?

Consider the number of children and their lifecycle.

| Relationship                         | Common modeling choice                                |
| ------------------------------------ | ----------------------------------------------------- |
| User → Small set of preferences      | Embed                                                 |
| User → Few addresses                 | Embed or reference, depending on access and ownership |
| User → Thousands of orders           | Separate order documents with `userId`                |
| Product → Millions of reviews        | Separate review documents                             |
| Product → Small fixed specifications | Embed                                                 |

**Important:** A one-to-many relationship does not automatically mean embedding an array. Large or unbounded child collections should generally be modeled separately.

---

## 6. Many-to-Many Relationships

A many-to-many relationship means multiple records from one entity can be associated with multiple records from another entity.

Examples:

```text
Students ↔ Courses
Users ↔ Roles
Products ↔ Categories
Employees ↔ Projects
```

Consider:

```text
Student A ───── Course 1
    |              |
    |              |
    +──────── Course 2
                   |
Student B ─────────+
```

A student can enroll in multiple courses.

A course can contain multiple students.

### 6.1 Option A: Store references on both sides

Students collection:

```json
{
  "_id": 101,
  "name": "Rahul",
  "courseIds": [501, 502]
}
```

Courses collection:

```json
{
  "_id": 501,
  "name": "Database Systems",
  "studentIds": [101, 102]
}
```

This makes it convenient to retrieve related IDs from either side.

However, maintaining both arrays introduces consistency problems.

For example, when Rahul enrolls in a course, both documents may need updates.

### 6.2 Option B: Use a separate relationship collection

Students:

```json
{
  "_id": 101,
  "name": "Rahul"
}
```

Courses:

```json
{
  "_id": 501,
  "name": "Database Systems"
}
```

Enrollments:

```json
{
  "_id": 9001,
  "studentId": 101,
  "courseId": 501,
  "enrolledAt": "2026-11-14T10:00:00Z"
}
```

Another enrollment:

```json
{
  "_id": 9002,
  "studentId": 101,
  "courseId": 502,
  "enrolledAt": "2026-11-14T11:00:00Z"
}
```

The relationship is represented as its own document.

Visual representation:

```text
Students          Enrollments          Courses

Student 101 ----> 101 / 501 ---------> Course 501
             \
              ---> 101 / 502 ---------> Course 502
```

### 6.3 Why use a relationship collection?

- Relationships can grow independently.
- Additional relationship attributes can be stored.
- Enrollment status can be tracked.
- Relationships can be queried and paginated.
- Duplicate relationships can be prevented with a suitable unique compound index.

Example:

```javascript
db.enrollments.createIndex(
  {
    studentId: 1,
    courseId: 1,
  },
  {
    unique: true,
  },
);
```

### 6.4 When should we use each approach?

| Requirement                            | Suitable approach                                          |
| -------------------------------------- | ---------------------------------------------------------- |
| Small, bounded relationships           | Embedded references may work                               |
| Large many-to-many relationships       | Separate relationship collection                           |
| Relationship has its own attributes    | Separate relationship collection                           |
| Both directions are frequently queried | Consider indexing both directions                          |
| Relationships change frequently        | Separate relationship documents are often easier to manage |

---

## 7. Embedded Arrays vs Referenced Arrays

Arrays are extremely useful in document databases.

But the choice between embedding objects in an array and storing references in an array matters.

### 7.1 Embedded array

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "addresses": [
    {
      "type": "home",
      "city": "Noida"
    },
    {
      "type": "office",
      "city": "Delhi"
    }
  ]
}
```

The addresses are embedded inside the user document.

Useful when:

- The number of addresses is small.
- Addresses belong exclusively to the user.
- They are frequently retrieved with the user.
- Their lifecycle is tied to the user.

### 7.2 Array of references

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "addressIds": [501, 502]
}
```

Addresses collection:

```json
{
  "_id": 501,
  "type": "home",
  "city": "Noida"
}
```

```json
{
  "_id": 502,
  "type": "office",
  "city": "Delhi"
}
```

Useful when:

- Address documents are independently managed.
- Other entities may share the same referenced data.
- The referenced data is large.
- The parent document should remain small.

### 7.3 A critical distinction

Embedding an array of objects is not the same as embedding an array of IDs.

```json
{
  "addresses": [
    {
      "city": "Noida"
    }
  ]
}
```

versus:

```json
{
  "addressIds": [501, 502]
}
```

The first stores the actual address information.

The second stores identifiers that must be resolved separately.

---

## 8. Unbounded Arrays: A Major Design Problem

An unbounded array is an array that can grow continuously without a predictable upper limit.

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "orders": [{ "orderId": 5001 }, { "orderId": 5002 }, { "orderId": 5003 }]
}
```

Initially, this may look fine.

But imagine Rahul places 10,000 orders.

The user document becomes very large.

### 8.1 Why are unbounded arrays problematic?

1. Document size increases continuously.
2. Reading the parent may involve retrieving unnecessary array data.
3. Updating large arrays can become expensive.
4. Array indexes can consume additional storage.
5. Concurrent updates can create contention.
6. MongoDB documents have a maximum BSON size of 16 MiB.

### 8.2 Better approach: Store children separately

Users:

```json
{
  "_id": 101,
  "name": "Rahul"
}
```

Orders:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500
}
```

```json
{
  "_id": 5002,
  "userId": 101,
  "total": 1500
}
```

Create an index:

```javascript
db.orders.createIndex({
  userId: 1,
});
```

Retrieve a user's orders:

```javascript
db.orders
  .find({
    userId: 101,
  })
  .sort({
    _id: -1,
  })
  .limit(20);
```

This allows orders to be retrieved independently and paginated.

### 8.3 The bounded-array rule

Embedding is generally more suitable when the number of child elements is predictably small.

Referencing is generally more suitable when the number of child elements can grow without a reliable upper bound.

This is a useful starting rule, not an absolute restriction.

---

## 9. Data Duplication and Denormalization

Document databases frequently use denormalization.

Denormalization means intentionally storing duplicated information to improve retrieval or reduce the need for additional queries.

Consider an order:

```json
{
  "_id": 5001,
  "userId": 101,
  "productId": 501,
  "quantity": 2
}
```

When displaying the order, we may also need:

- Product name.
- Product price.
- Product image.

We could retrieve the product separately.

Alternatively, we can store a snapshot of selected product information in the order.

```json
{
  "_id": 5001,
  "userId": 101,
  "items": [
    {
      "productId": 501,
      "productName": "Laptop",
      "unitPriceAtPurchase": 65000,
      "quantity": 2
    }
  ],
  "total": 130000
}
```

Now the order contains a snapshot of the purchased product details.

### 9.1 Why duplicate data?

Suppose the current product price changes:

```text
Old price: ₹65,000
New price: ₹70,000
```

The historical order should still show the price at which the customer purchased the product.

If we only referenced the current product price, the historical order could display an incorrect amount.

Here, duplication is intentional and desirable.

### 9.2 Advantages of denormalization

- Fewer queries.
- Faster reads for common access patterns.
- Historical snapshots.
- Reduced dependency on frequently accessed related documents.

### 9.3 Disadvantages

- More storage.
- Multiple copies of information.
- More complex update logic.
- Potential inconsistency if duplicated values are not managed properly.

### 9.4 When should duplicated data be updated?

There are two different cases.

**Case A: Historical snapshot**

Example:

```text
Order → Product name and price at purchase time
```

Do not update the historical snapshot just because the current product changes.

**Case B: Current duplicated information**

Example:

```text
User name copied into multiple documents for display
```

If the user's name changes, decide whether:

- Every duplicate should be updated.
- The old value should remain as a snapshot.
- The application should retrieve the current user information separately.

The business requirement determines the correct behavior.

---

## 10. MongoDB Schema Design Patterns

MongoDB supports several document modeling patterns.

Understanding these patterns helps when designing production applications.

### 10.1 Attribute Pattern

The Attribute Pattern is useful when documents have many possible attributes, but only a subset applies to each document.

Example:

```json
{
  "_id": 501,
  "name": "Laptop",
  "attributes": [
    {
      "key": "processor",
      "value": "Intel i7"
    },
    {
      "key": "ram",
      "value": "16GB"
    },
    {
      "key": "storage",
      "value": "512GB SSD"
    }
  ]
}
```

Another product:

```json
{
  "_id": 502,
  "name": "T-Shirt",
  "attributes": [
    {
      "key": "size",
      "value": "L"
    },
    {
      "key": "color",
      "value": "Black"
    },
    {
      "key": "material",
      "value": "Cotton"
    }
  ]
}
```

Why use it?

Different products have different attributes.

Instead of creating hundreds of optional fields, attributes are stored in a consistent array structure.

This pattern can be useful for flexible product catalogs.

### 10.2 Bucket Pattern

The Bucket Pattern groups multiple related records into one document.

Example: sensor readings.

Instead of storing each reading in a separate document:

```json
{
  "deviceId": 101,
  "timestamp": "2026-11-14T10:00:00Z",
  "temperature": 30
}
```

We can group readings into a bucket:

```json
{
  "deviceId": 101,
  "date": "2026-11-14",
  "readings": [
    {
      "timestamp": "2026-11-14T10:00:00Z",
      "temperature": 30
    },
    {
      "timestamp": "2026-11-14T10:01:00Z",
      "temperature": 31
    },
    {
      "timestamp": "2026-11-14T10:02:00Z",
      "temperature": 29
    }
  ]
}
```

Benefits:

- Fewer documents.
- Efficient grouped retrieval.
- Can reduce index overhead.
- Useful for time-oriented data.

The bucket must have a controlled size and time range. Do not let it grow indefinitely.

### 10.3 Subset Pattern

The Subset Pattern stores frequently accessed information separately from less frequently accessed information.

Suppose a product has 500 reviews.

Most users only need the latest five reviews on the product page.

Instead of retrieving all 500 reviews, we can store a small subset inside the product document.

```json
{
  "_id": 501,
  "name": "Laptop",
  "price": 65000,
  "recentReviews": [
    {
      "userId": 101,
      "rating": 5,
      "comment": "Excellent"
    },
    {
      "userId": 102,
      "rating": 4,
      "comment": "Good"
    }
  ]
}
```

The full review collection remains separate.

Benefits:

- Faster common reads.
- Smaller data retrieval.
- Full data remains independently accessible.

The application must maintain the subset when reviews are added or updated.

### 10.4 Extended Reference Pattern

The Extended Reference Pattern stores a reference along with selected fields from the referenced document.

Example:

```json
{
  "_id": 5001,
  "user": {
    "userId": 101,
    "name": "Rahul"
  },
  "total": 2500
}
```

Instead of storing only:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500
}
```

Why?

If order listings frequently display the customer's name, the application can avoid retrieving the user document for every order.

The copied name may become stale if the user changes their name, so decide whether the value is a snapshot or a current display field.

### 10.5 Computed Pattern

The Computed Pattern stores precomputed values instead of recalculating expensive results on every request.

Example:

```json
{
  "_id": 501,
  "name": "Laptop",
  "totalReviews": 1200,
  "averageRating": 4.6
}
```

Without these fields, the application might need to calculate the average rating from thousands of review documents repeatedly.

Precomputed values improve read performance.

However, the application must update them correctly when reviews change.

### 10.6 Pattern comparison

| Pattern            | Main purpose                         | Example                |
| ------------------ | ------------------------------------ | ---------------------- |
| Attribute          | Handle varying attributes            | Product specifications |
| Bucket             | Group related records                | Sensor readings        |
| Subset             | Keep frequently used data nearby     | Latest five reviews    |
| Extended Reference | Duplicate selected referenced fields | Customer name in order |
| Computed           | Store precomputed values             | Average product rating |

These patterns can be combined in one application.

---

## 11. Modeling an E-Commerce Application

Let's design a simplified e-commerce database using MongoDB.

We will use these collections:

```text
users
products
orders
payments
reviews
```

### 11.1 Users collection

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "addresses": [
    {
      "type": "home",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "pincode": "201301"
    }
  ],
  "createdAt": "2026-11-14T10:00:00Z"
}
```

Why embed addresses?

- They belong to the user.
- The number is usually bounded.
- They are commonly accessed with the user.

### 11.2 Products collection

```json
{
  "_id": 501,
  "name": "Laptop",
  "category": "Electronics",
  "price": 65000,
  "specifications": {
    "processor": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  },
  "averageRating": 4.6,
  "totalReviews": 1200
}
```

Why embed specifications?

Different product categories have different specifications, and they are commonly retrieved with the product.

The rating fields can be maintained using the Computed Pattern.

### 11.3 Orders collection

```json
{
  "_id": 5001,
  "userId": 101,
  "items": [
    {
      "productId": 501,
      "productName": "Laptop",
      "unitPriceAtPurchase": 65000,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201301"
  },
  "total": 65000,
  "status": "confirmed",
  "createdAt": "2026-11-14T10:30:00Z"
}
```

Why embed order items?

- They are part of the order.
- They are commonly retrieved with the order.
- Their purchased prices must remain historically accurate.
- The number of items in a single order is usually bounded by business rules.

Why store `userId`?

- A user can have many orders.
- Orders have an independent lifecycle.
- Order history needs pagination.

Why snapshot the shipping address?

The customer may change their default address after placing the order. The historical order must retain the address used for that purchase.

### 11.4 Payments collection

```json
{
  "_id": 7001,
  "orderId": 5001,
  "userId": 101,
  "amount": 65000,
  "status": "successful",
  "provider": "payment_gateway",
  "transactionReference": "txn_abc123",
  "createdAt": "2026-11-14T10:35:00Z"
}
```

Why separate payments?

- Payments have their own lifecycle.
- An order may have multiple payment attempts.
- Payment reconciliation may need independent queries.
- Payment records require careful durability and audit handling.

### 11.5 Reviews collection

```json
{
  "_id": 9001,
  "productId": 501,
  "userId": 101,
  "rating": 5,
  "comment": "Excellent product",
  "createdAt": "2026-11-14T12:00:00Z"
}
```

Why separate reviews?

- A product can have many reviews.
- Reviews can grow without a fixed limit.
- Reviews need independent pagination and moderation.

### 11.6 Architecture overview

```text
                  E-COMMERCE DATABASE
                           |
       +-------------------+-------------------+
       |                   |                   |
       v                   v                   v
     users              products             orders
       |                   |                   |
       |                   |                   |
       v                   v                   v
   Addresses           Specifications       Order Items
   Embedded            Embedded             Embedded
                                               |
                                      +--------+--------+
                                      |                 |
                                      v                 v
                                   Payments           Users
                                   Separate           Referenced

                         products
                            |
                            v
                         Reviews
                         Separate
```

This design combines embedding, referencing, and intentional duplication.

There is no requirement to use only one modeling approach throughout a document database.

---

## 12. Indexing Considerations in Document Modeling

Good document modeling and good indexing work together.

Suppose we frequently retrieve orders by user ID.

Query:

```javascript
db.orders.find({
  userId: 101,
});
```

Create an index:

```javascript
db.orders.createIndex({
  userId: 1,
});
```

Now MongoDB can use the index to locate matching orders rather than necessarily scanning the entire collection.

### 12.1 Compound index

Suppose we frequently retrieve a user's orders sorted by creation time.

Query:

```javascript
db.orders
  .find({
    userId: 101,
  })
  .sort({
    createdAt: -1,
  })
  .limit(20);
```

A suitable compound index may be:

```javascript
db.orders.createIndex({
  userId: 1,
  createdAt: -1,
});
```

This supports the filter and sort pattern.

### 12.2 Indexing nested fields

Suppose we query users by city:

```javascript
db.users.find({
  "address.city": "Noida",
});
```

Create an index:

```javascript
db.users.createIndex({
  "address.city": 1,
});
```

MongoDB supports indexes on nested document fields.

### 12.3 Indexing array fields

Suppose we query products by tags:

```json
{
  "_id": 501,
  "name": "Laptop",
  "tags": ["electronics", "computer", "portable"]
}
```

Query:

```javascript
db.products.find({
  tags: "electronics",
});
```

An index can be created:

```javascript
db.products.createIndex({
  tags: 1,
});
```

MongoDB automatically creates a multikey index when indexing an array field.

### Important consideration

Indexes improve supported queries but consume storage and add write-maintenance overhead.

Create indexes based on actual query patterns, not on every field.

---

## 13. MongoDB Atomicity and Document Design

One important advantage of embedding is single-document atomicity.

MongoDB guarantees that a write operation affecting one document is atomic.

Consider:

```json
{
  "_id": 101,
  "balance": 1000,
  "lastUpdated": "2026-11-14T10:00:00Z"
}
```

Suppose we need to update the balance and timestamp together.

```javascript
db.accounts.updateOne(
  {
    _id: 101,
  },
  {
    $inc: {
      balance: -100,
    },
    $set: {
      lastUpdated: new Date(),
    },
  },
);
```

Both changes occur atomically within the document.

### Why does this matter?

Suppose related data is split across separate documents.

A workflow may need to update:

- An account document.
- A transaction document.
- An audit document.

Now the operation spans multiple documents.

If all-or-nothing behavior is required, a multi-document transaction may be necessary.

### Design implication

When multiple fields must always change together, embedding them in one document can simplify atomic updates.

However, do not embed unrelated or unbounded data solely to avoid transactions.

Choose a model that satisfies both data lifecycle and correctness requirements.

---

## 14. Handling Large Documents and Large Arrays

MongoDB documents have a maximum BSON size of 16 MiB.

This is a hard limit.

Consider:

```json
{
  "_id": 101,
  "name": "Rahul",
  "activityLogs": [
    // Thousands or millions of entries
  ]
}
```

As the array grows:

- Document size increases.
- Updates can become expensive.
- Retrieving the parent can become inefficient.
- The document can approach the size limit.

### Better design

Store activity logs separately:

```json
{
  "_id": 90001,
  "userId": 101,
  "action": "login",
  "createdAt": "2026-11-14T10:00:00Z"
}
```

```json
{
  "_id": 90002,
  "userId": 101,
  "action": "profile_updated",
  "createdAt": "2026-11-14T10:10:00Z"
}
```

Create an index:

```javascript
db.activityLogs.createIndex({
  userId: 1,
  createdAt: -1,
});
```

Retrieve recent activity:

```javascript
db.activityLogs
  .find({
    userId: 101,
  })
  .sort({
    createdAt: -1,
  })
  .limit(50);
```

This keeps user documents small while supporting independent activity retrieval.

### When might bucketing help?

If the activity data is naturally time-based, a bucket structure may be appropriate.

For example, group activity records by user and day.

The bucket should have explicit limits on record count, time range, or size.

---

## 15. Schema Versioning and Schema Evolution

Document databases allow different document structures to coexist.

However, changing an application's data model can create compatibility issues.

Suppose the original user document is:

```json
{
  "_id": 101,
  "name": "Rahul",
  "phone": "9876543210"
}
```

Later, the application introduces country codes:

```json
{
  "_id": 101,
  "name": "Rahul",
  "phone": {
    "countryCode": "+91",
    "number": "9876543210"
  }
}
```

Now old and new documents have different structures.

Application code must handle both versions during migration.

### 15.1 Add a schema version

```json
{
  "_id": 101,
  "schemaVersion": 2,
  "name": "Rahul",
  "phone": {
    "countryCode": "+91",
    "number": "9876543210"
  }
}
```

The application can interpret documents according to their version.

### 15.2 Migration strategies

Common approaches include:

**1. Immediate migration**

Update all existing documents before deploying code that expects the new structure.

**2. Gradual migration**

Update documents in batches while supporting both old and new structures.

**3. Migration on read or write**

When an old document is accessed, the application converts it to the new structure.

### 15.3 Why does schema evolution matter?

Without a migration strategy:

- Old documents may break new code.
- Queries may return inconsistent results.
- Validation may reject old records.
- Different application versions may interpret fields differently.

Flexible schema reduces some migration friction, but it does not eliminate schema evolution problems.

---

## 16. Practical Modeling Decision Framework

Before embedding or referencing, ask these questions.

| Question                                            | If yes | Likely direction                 |
| --------------------------------------------------- | ------ | -------------------------------- |
| Is related data always retrieved with the parent?   | Yes    | Consider embedding               |
| Is the number of related records small and bounded? | Yes    | Consider embedding               |
| Does related data have an independent lifecycle?    | Yes    | Consider referencing             |
| Can the child collection grow indefinitely?         | Yes    | Consider separate documents      |
| Is the same data shared by many entities?           | Yes    | Consider referencing             |
| Must related fields be updated atomically together? | Yes    | Consider embedding               |
| Is a historical snapshot required?                  | Yes    | Consider intentional duplication |
| Does the application need independent pagination?   | Yes    | Consider separate documents      |

These are decision signals, not rigid rules.

### A practical decision flow

```text
              Related Data
                   |
                   v
       Retrieved with Parent Often?
                   |
             +-----+-----+
             |           |
            Yes          No
             |           |
             v           v
        Is It Bounded?   Reference
             |
        +----+----+
        |         |
       Yes        No
        |         |
        v         v
      Embed     Reference
```

Then consider:

- Whether the child has an independent lifecycle.
- Whether the data is shared.
- Whether atomic updates are needed.
- Whether duplication is intentional.

---

## 17. Common Document Modeling Mistakes

| Mistake                                            | Why it is problematic              | Better approach                             |
| -------------------------------------------------- | ---------------------------------- | ------------------------------------------- |
| Embedding every relationship                       | Can create oversized documents     | Evaluate access patterns and lifecycle      |
| Storing thousands of child IDs in a parent         | Parent array becomes unbounded     | Store child documents separately            |
| Duplicating data without an update strategy        | Creates inconsistency              | Define snapshot or synchronization behavior |
| Using references for every relationship            | Causes unnecessary queries         | Embed small, closely related data           |
| Embedding unlimited logs                           | Document grows continuously        | Separate collection or bucket pattern       |
| Ignoring indexes                                   | Queries may scan large collections | Index actual query patterns                 |
| Storing historical order prices as live references | Historical values can change       | Store purchase-time snapshots               |
| Using one document for unrelated entities          | Creates complex updates            | Model independent entities separately       |
| Ignoring document size                             | Can hit 16 MiB limit               | Monitor growth and use bounded structures   |
| Assuming flexible schema means no validation       | Inconsistent documents accumulate  | Use validation and versioning               |

---

## 18. Interview Questions and Answers

### Q1. What is the difference between embedding and referencing?

Embedding stores related information inside the same document. Referencing stores related information separately and connects it through identifiers.

### Q2. When should you embed documents in MongoDB?

When related data is commonly accessed with the parent, is reasonably bounded, and shares a similar lifecycle.

### Q3. When should you use references?

When data is large, shared, independently managed, or can grow without a predictable upper limit.

### Q4. How would you model a user with thousands of orders?

Keep the user in the `users` collection and store orders separately with a `userId` reference. Index `userId` and paginate order retrieval.

### Q5. What is an unbounded array?

An array that can grow continuously without a predictable maximum size.

### Q6. Why are unbounded arrays dangerous?

They can cause large documents, expensive updates, unnecessary data retrieval, and eventually reach the 16 MiB document limit.

### Q7. How would you model a many-to-many relationship?

Use references or a separate relationship collection. A separate collection is particularly useful when relationships are numerous or have their own attributes.

### Q8. What is denormalization?

Intentionally duplicating selected data to improve retrieval performance or simplify common access patterns.

### Q9. Why would you store product information inside an order?

To preserve a historical snapshot of the product name and purchase price at the time of the transaction.

### Q10. What is the Bucket Pattern?

A pattern that groups multiple related records into one document, often based on time or another logical grouping.

### Q11. What is the Subset Pattern?

A pattern that keeps frequently accessed data in a smaller embedded subset while storing the complete dataset separately.

### Q12. What is the Attribute Pattern?

A pattern that stores varying attributes in a consistent structure, often an array of key-value documents.

### Q13. What is the Extended Reference Pattern?

A pattern that stores a reference together with selected fields from the referenced document to reduce additional lookups.

### Q14. What is the Computed Pattern?

A pattern that stores precomputed values so expensive calculations do not need to be repeated for every read.

### Q15. What is schema versioning?

A technique for identifying different document structures so application code can handle old and new document formats safely.

### Q16. Does embedding guarantee atomicity across multiple documents?

No. Embedding can provide atomicity for operations on one document. Operations across multiple documents require appropriate coordination, such as a transaction when all-or-nothing behavior is needed.

### Q17. Why should we index a reference field such as `userId`?

To support efficient queries that retrieve related documents, such as finding all orders belonging to a user.

### Q18. Is denormalization always good for performance?

No. It can improve reads but increases storage, write complexity, and consistency-management requirements.

---

## 19. Practical Exercises

### Exercise 1: Model a user profile

Requirements:

- User has a name and email.
- User can have multiple addresses.
- User has preferences.
- User can have thousands of orders.

Design the collections.

Decide:

1. Should addresses be embedded?
2. Should preferences be embedded?
3. Should orders be embedded?
4. Which fields should be indexed?

### Exercise 2: Design a product catalog

Requirements:

- Products belong to categories.
- Different categories have different attributes.
- Products have thousands of reviews.
- Product pages show the latest five reviews.
- Product pages show average rating.

Consider using:

- Attribute Pattern.
- Subset Pattern.
- Computed Pattern.
- Separate reviews collection.

Explain your design.

### Exercise 3: Design an order system

Requirements:

- Users can place multiple orders.
- An order can contain multiple products.
- Product prices can change.
- An order can have multiple payment attempts.
- Orders must preserve the original shipping address.

Decide:

1. Which data should be embedded?
2. Which data should be referenced?
3. Which data should be duplicated intentionally?
4. How would you preserve historical values?
5. What indexes would you create?

### Exercise 4: Fix an unbounded array

Current design:

```json
{
  "_id": 101,
  "name": "Rahul",
  "activityLogs": [
    {
      "action": "login",
      "createdAt": "2026-11-14T10:00:00Z"
    },
    {
      "action": "logout",
      "createdAt": "2026-11-14T11:00:00Z"
    }
  ]
}
```

The application stores every activity inside this array.

Redesign it for millions of activity records.

### Exercise 5: Many-to-many relationship

Design a student-course enrollment system.

Requirements:

- One student can enroll in multiple courses.
- One course has multiple students.
- Enrollment has a date and status.
- Duplicate enrollment must be prevented.

Design:

- Collections.
- Document structures.
- Unique indexes.
- Queries for a student's courses.
- Queries for a course's students.

---

## 20. Chapter Summary

| Concept                    | Key takeaway                                                  |
| -------------------------- | ------------------------------------------------------------- |
| Document modeling          | Design documents around access patterns                       |
| Embedding                  | Store related data inside the parent document                 |
| Referencing                | Store related data separately using identifiers               |
| One-to-one                 | Often embedded when data is small and closely related         |
| One-to-many                | Embed bounded children; reference large or unbounded children |
| Many-to-many               | Use references or a separate relationship collection          |
| Unbounded arrays           | Can cause document growth and performance problems            |
| Denormalization            | Intentionally duplicate selected information                  |
| Attribute Pattern          | Handle variable attributes                                    |
| Bucket Pattern             | Group related records                                         |
| Subset Pattern             | Store frequently accessed data nearby                         |
| Extended Reference Pattern | Copy selected referenced fields                               |
| Computed Pattern           | Store precomputed values                                      |
| Schema versioning          | Manage document structure changes                             |
| Indexing                   | Optimize actual query patterns                                |
| Single-document atomicity  | Related changes in one document can be atomic                 |

### Final mental model

```text
                 DOCUMENT DATA MODELING
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
          EMBEDDING      REFERENCING    DENORMALIZATION
             |              |              |
             v              v              v
       Related data     Independent     Intentional
       stored together  documents       duplication
             |              |              |
             +--------------+--------------+
                            |
                            v
                    ACCESS PATTERNS
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
        One-to-One      One-to-Many    Many-to-Many
             |              |              |
             v              v              v
        Embed or       Bounded or      Relationship
        Reference      Unbounded       Collection
```

### The most important points to remember

1. Document modeling should start with application access patterns.
2. Embedding is useful for small, related, frequently accessed data.
3. Referencing is useful for large, shared, or independently managed data.
4. Unbounded arrays are a major document modeling risk.
5. Denormalization is intentional duplication, not automatically bad design.
6. Historical records often need snapshots of changing data.
7. MongoDB provides multiple schema design patterns for different workloads.
8. Indexes should support the queries your application actually runs.
9. Flexible schema still requires validation and migration planning.
10. A well-designed document database often combines embedding, referencing, and denormalization.

**Engineering takeaway:** Do not model MongoDB by blindly converting every relational table into a collection or embedding every related record. Model the data around how the application reads, writes, updates, and manages it over time.
