---
sidebar_label: Database Replication
sidebar_position: 1
---

# Database Replication

## 1. What Is Database Replication?

Database replication is the process of maintaining copies of database data across multiple database servers.

Instead of keeping all database data on one server, we maintain copies on other servers so that the system can improve:

- Availability
- Read performance
- Disaster recovery
- Geographic distribution
- Operational flexibility

### Example

Imagine an e-commerce application with one PostgreSQL database server.

It handles:

- User registrations
- Product queries
- Order creation
- Payment records
- Order history

As the application grows, the database server may become a bottleneck. A large number of users might be reading product details while other users are creating orders.

One approach is to introduce replicas.

```text
                 Node.js Application
                         |
                         |
                  Primary Database
                         |
                Replicated Changes
                   /         \
                  /           \
          Replica 1         Replica 2
```

The primary database handles writes. Replicas maintain copies of its data.

Depending on the architecture and consistency requirements, some reads can also be served by replicas.

**Important:** Replication copies data. It does not divide the dataset into separate pieces. Dividing data across multiple database nodes is called sharding.

---

## 2. Why Do We Need Replication?

Replication solves several problems that become important as an application grows.

### 2.1 Improve Read Performance

Consider an application receiving:

- 10,000 product-page requests per minute
- 500 order-creation requests per minute
- 2,000 user-profile requests per minute

Most requests are reads.

If one database server handles every read and write, read traffic can consume resources needed by write operations.

With replicas:

```text
                   Application
                       |
              Database Router
                 /         \
                /           \
          Writes             Reads
             |                 |
          Primary          Replicas
                            /     \
                       Replica 1  Replica 2
```

The primary handles writes, while replicas can serve suitable read queries.

This is called **read scaling**.

However, replicas must have sufficient resources to handle their assigned traffic. Adding replicas does not automatically guarantee better performance.

### 2.2 Improve Availability

Suppose your primary database server crashes.

Without replication:

```text
Application
     |
     X
Primary Database Down
```

The application may lose database availability until the database is restored.

With a replicated architecture:

```text
                 Application
                      |
                 Primary DB
                 (Failed)
                      X

                 Replica DB
                 (Available)
```

A replica can potentially be promoted to become the new primary.

This process is called **failover**.

Replication provides the foundation for failover, but replication alone does not perform every step required for automatic recovery.

Failover also requires mechanisms for:

- Detecting primary failure
- Selecting a suitable replica
- Promoting it
- Redirecting application connections

We will study replication challenges separately in Part 6D.

### 2.3 Disaster Recovery

Imagine your primary database is hosted in one geographical region.

A major infrastructure failure affects that region.

You can maintain a replica in another region:

```text
       Region A                     Region B

    Primary DB  ---------------->  Replica DB
       |                               |
    Application                    DR Setup
```

If Region A becomes unavailable, the replica in Region B may be used to recover the application.

This is useful for disaster recovery.

### 2.4 Separate Reporting Workloads

Suppose your application performs two types of queries:

**Transactional queries:**

- Create an order
- Update payment status
- Update inventory
- Register users

**Reporting queries:**

- Calculate monthly revenue
- Generate sales reports
- Count daily registrations
- Analyze product performance

Reporting queries can be computationally expensive.

Running them on the primary database may affect normal application operations.

A replica can serve reporting workloads:

```text
             Application
                  |
             Primary DB
                  |
              Replication
                  |
             Replica DB
                  |
          Reporting Queries
```

This separates some reporting workload from the primary.

However, the reporting data may not include the latest committed changes yet. Whether that is acceptable depends on the reporting requirement.

---

## 3. Primary–Replica Architecture

A common replication architecture consists of:

1. Primary database
2. One or more replica databases

### 3.1 Primary Database

The primary is the database server that accepts the main write operations.

Examples:

- INSERT
- UPDATE
- DELETE
- DDL operations, depending on the replication mechanism

For example:

```sql
INSERT INTO users (name, email)
VALUES ('Prashant', 'prashant@example.com');

UPDATE products
SET price = 999
WHERE product_id = 101;

DELETE FROM sessions
WHERE expires_at < NOW();
```

These changes are made on the primary.

### 3.2 Replica Database

A replica maintains a copy of data from another database server.

In a typical PostgreSQL physical streaming replication setup:

- The primary accepts writes.
- The primary generates WAL records.
- WAL changes are transferred to the standby.
- The standby replays those changes.
- The standby maintains a copy of the primary's database state.

```text
             Application
                  |
                  | INSERT / UPDATE / DELETE
                  |
             Primary DB
                  |
               WAL Logs
                  |
           Replication Stream
                  |
              Replica DB
```

A standard PostgreSQL physical standby is read-only while it is in recovery.

It is not another independent writable primary.

### 3.3 Primary vs Replica

| Feature                   | Primary           | Physical Standby / Replica |
| ------------------------- | ----------------- | -------------------------- |
| Main purpose              | Accept writes     | Maintain a copy            |
| INSERT                    | Yes               | No, while in recovery      |
| UPDATE                    | Yes               | No, while in recovery      |
| DELETE                    | Yes               | No, while in recovery      |
| SELECT                    | Yes               | Yes                        |
| Generates primary WAL     | Yes               | Replays received WAL       |
| Can become primary        | Already primary   | Can be promoted            |
| Maintains replicated data | Source of changes | Applies changes            |

**Terminology:** Modern PostgreSQL documentation generally uses _primary_ and _standby_. The older terms _master_ and _slave_ may still appear in older documentation and tooling.

---

## 4. How Replication Works Internally in PostgreSQL

To understand PostgreSQL replication, you first need to understand WAL.

### 4.1 What Is WAL?

WAL stands for **Write-Ahead Logging**.

It is a mechanism PostgreSQL uses to record database changes in a log before the corresponding modified data pages are considered safely written to the database files.

The basic principle is:

> Log the change before relying on the modified data page being written to disk.

For example, suppose an application executes:

```sql
UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;
```

PostgreSQL must record the relevant changes in its WAL.

Conceptually:

```text
Application
     |
     | UPDATE accounts
     |
PostgreSQL
     |
     | Generate WAL records
     |
     v
WAL Files
     |
     v
Database Data Pages
```

WAL is important for:

- Crash recovery
- Durability
- Physical replication
- Point-in-time recovery when combined with appropriate archived WAL and backups

WAL is not simply a log of SQL statements. It records information needed to reproduce database changes.

### 4.2 How WAL Enables Physical Replication

Consider a primary PostgreSQL server and a standby server.

When a transaction changes data on the primary:

**Step 1: Application sends a write**

```sql
INSERT INTO orders (user_id, total_amount)
VALUES (10, 2500);
```

**Step 2: Primary generates WAL records**

PostgreSQL generates WAL records representing the required changes.

**Step 3: WAL is made available for replication**

The primary's WAL sender process can transmit WAL data to connected standby servers.

**Step 4: Standby receives WAL**

The standby's WAL receiver process receives the WAL stream.

**Step 5: Standby replays WAL**

The standby replays the received WAL records to apply the corresponding changes.

```text
             PRIMARY SERVER
          ---------------------
          Application Write
                  |
                  v
             PostgreSQL
                  |
                  v
              WAL Records
                  |
                  v
             WAL Sender
                  |
                  | WAL Stream
                  |
                  v
              WAL Receiver
                  |
                  v
              STANDBY
          ---------------------
              WAL Replay
                  |
                  v
          Updated Database State
```

The standby gradually reproduces the primary's database state.

This mechanism is the foundation of PostgreSQL physical streaming replication.

### 4.3 WAL Sender and WAL Receiver

PostgreSQL uses background processes for replication.

| Component       | Responsibility                   |
| --------------- | -------------------------------- |
| WAL Sender      | Sends WAL data from the primary  |
| WAL Receiver    | Receives WAL data on the standby |
| Startup process | Replays WAL during recovery      |

The WAL sender and receiver are important components of streaming replication.

---

## 5. Types of Database Replication

At a high level, two important replication approaches are:

1. Physical replication
2. Logical replication

They differ in what is replicated and how changes are represented.

### 5.1 Physical Replication

Physical replication copies database changes at the physical database-storage level using WAL.

In PostgreSQL, the standby receives WAL and replays it to maintain a physical copy of the primary database cluster.

```text
        Primary PostgreSQL
        ------------------
          Database Files
                |
             WAL Data
                |
                v
        Standby PostgreSQL
        ------------------
          Database Files
```

Characteristics:

- Replicates physical database changes through WAL.
- Maintains a physical copy of the database cluster.
- Commonly used for high availability and disaster recovery.
- A physical standby can serve read queries when configured as a hot standby.
- Standard physical replication requires compatible PostgreSQL major versions; it is not a general-purpose cross-major-version migration mechanism.

**Example:** A production PostgreSQL server has two physical standby servers that maintain copies of its database.

### 5.2 Logical Replication

Logical replication replicates logical changes to selected database objects rather than copying the entire physical database cluster.

In PostgreSQL, logical replication uses concepts such as:

- Publication
- Subscription
- Publisher
- Subscriber

A publisher defines which changes should be published.

A subscriber receives and applies those changes.

```text
           Publisher Database
          --------------------
             users table
             orders table
             payments table
                   |
             Publication
                   |
                   v
            Logical Changes
                   |
                   v
           Subscriber Database
          ---------------------
             users table
             orders table
```

For example, suppose a company has:

- An application database containing users, orders, and payments.
- A reporting database that needs users and orders.

Logical replication can be configured to replicate selected tables.

Example conceptual setup:

```sql
-- On publisher
CREATE PUBLICATION app_publication
FOR TABLE users, orders;
```

On the subscriber:

```sql
-- On subscriber
CREATE SUBSCRIPTION app_subscription
CONNECTION 'host=publisher-host dbname=appdb user=replication_user password=secret'
PUBLICATION app_publication;
```

These are illustrative SQL commands. A real setup also requires appropriate network connectivity, authentication, permissions, and publication/subscription configuration.

Characteristics:

- Can replicate selected tables.
- Does not require copying the entire physical database cluster.
- Useful for data integration and distributing selected data.
- Publisher and subscriber can have different database structures, subject to compatibility requirements.
- It has different behavior and limitations from physical replication.

Logical replication is not simply a way to copy arbitrary SQL statements. It replicates supported logical data changes.

### 5.3 Physical vs Logical Replication

| Feature                     | Physical Replication                          | Logical Replication                      |
| --------------------------- | --------------------------------------------- | ---------------------------------------- |
| Replication level           | Physical database changes                     | Logical row-level changes                |
| Mechanism                   | WAL replay                                    | Logical decoding and replication         |
| Scope                       | Database cluster                              | Selected publications/tables             |
| Selective table replication | No, not in the same way                       | Yes                                      |
| Typical use                 | Standby, HA, disaster recovery                | Data distribution, integration           |
| Standby behavior            | Physical standby is read-only during recovery | Subscriber applies changes to its tables |
| Database structure          | Physical copy                                 | Can differ within supported constraints  |

**Remember:**

- Physical replication copies database changes at the physical level.
- Logical replication distributes selected logical data changes.

---

## 6. Replication vs Backup

This distinction is critical.

Replication and backup solve different problems.

### Replication

Replication maintains copies of data on other database servers.

Example:

```text
Primary DB
    |
    | Replication
    v
Replica DB
```

### Backup

A backup is a separate recoverable copy of database data.

Example:

```text
Primary DB
    |
    | Backup Process
    v
Backup Storage
```

### Why Replication Is Not a Backup

Suppose an administrator accidentally executes:

```sql
DELETE FROM users;
```

If the deletion is committed on the primary, the corresponding changes can be replicated to the standby.

The replica may therefore also lose those records.

Similarly, certain forms of corruption or unwanted changes can propagate.

A backup provides a recovery point that can be used to restore data from before the mistake.

| Feature                              | Replication                            | Backup                                    |
| ------------------------------------ | -------------------------------------- | ----------------------------------------- |
| Main purpose                         | Maintain copies on other servers       | Recover historical data                   |
| Keeps data synchronized              | Yes, according to replication behavior | Not necessarily                           |
| Helps with server failure            | Yes                                    | Yes, after restoration                    |
| Protects against accidental deletion | Not inherently                         | Yes, if a suitable recovery point exists  |
| Point-in-time recovery               | Not by itself                          | Possible with backups and WAL archiving   |
| Typical location                     | Another database server                | Separate storage or backup infrastructure |

A production database system often needs both replication and backups.

---

## 7. Replication and Application Architecture

Let's connect replication to a Node.js backend.

Suppose an application has:

- One primary PostgreSQL database.
- Two read replicas.
- A Node.js and Express backend.

### 7.1 Write Requests

Write requests should go to the primary.

Examples:

- Register a user.
- Create an order.
- Update inventory.
- Record a payment.

```text
POST /orders
      |
      v
Node.js Backend
      |
      v
Primary Database
```

### 7.2 Read Requests

Suitable read requests can be routed to replicas.

Examples:

- Product catalog.
- Historical reports.
- Public content.
- Some order-history queries.

```text
GET /products
      |
      v
Node.js Backend
      |
      v
Read Replica
```

### 7.3 Conceptual Node.js Example

You can create separate database pools for the primary and replica.

```javascript
const { Pool } = require("pg");

const primaryPool = new Pool({
  connectionString: process.env.PRIMARY_DATABASE_URL,
});

const replicaPool = new Pool({
  connectionString: process.env.REPLICA_DATABASE_URL,
});
```

Write operation:

```javascript
async function createOrder(userId, amount) {
  const result = await primaryPool.query(
    `INSERT INTO orders (user_id, total_amount)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, amount],
  );

  return result.rows[0];
}
```

Read operation:

```javascript
async function getProducts() {
  const result = await replicaPool.query(
    `SELECT * FROM products
     ORDER BY product_id DESC`,
  );

  return result.rows;
}
```

This is a simplified routing example. A real application also needs connection management, error handling, failover behavior, monitoring, and a deliberate consistency strategy.

### 7.4 Important: Read-After-Write Consistency

Consider this sequence:

1. A user creates an order.
2. The primary commits the order.
3. The application immediately queries the order from a replica.
4. The replica has not replayed the latest changes yet.

The application might not find the newly created order.

This is possible because replication can involve a delay.

A practical approach is:

- Send writes to the primary.
- Read immediately after a write from the primary when fresh data is required.
- Use replicas for reads where slightly older data is acceptable.

This is a fundamental application-design consideration.

We will explore replication lag and consistency challenges in Part 6D.

---

## 8. Replication vs Vertical Scaling vs Sharding

These three concepts solve different scaling problems.

| Concept          | What Changes?                                    | Main Goal                               |
| ---------------- | ------------------------------------------------ | --------------------------------------- |
| Vertical scaling | Increase resources of one server                 | Improve capacity of one database server |
| Replication      | Maintain copies across servers                   | Availability and read scaling           |
| Sharding         | Distribute different data subsets across servers | Distribute storage and write workload   |

### Vertical Scaling

```text
      One Database Server
      -------------------
        More CPU
        More RAM
        Faster Storage
```

### Replication

```text
             Primary
                |
          Replication
           /       \
       Replica   Replica
```

### Sharding

```text
          Application
               |
          Shard Router
          /     |     \
      Shard 1 Shard 2 Shard 3
      Users   Users   Users
      1-100   101-200 201-300
```

The key distinction:

- Vertical scaling increases the capacity of a server.
- Replication creates additional copies of data.
- Sharding distributes different portions of data across servers.

Replication does not automatically distribute writes across replicas. In a conventional primary–replica architecture, the primary remains responsible for the main write workload.

---

## 9. PostgreSQL Replication: Useful Monitoring Commands

PostgreSQL provides system views and functions that help inspect replication.

These are useful when working with a primary and standby setup.

### 9.1 Check Whether the Server Is in Recovery

```sql
SELECT pg_is_in_recovery();
```

Interpretation:

| Result  | Meaning                                                |
| ------- | ------------------------------------------------------ |
| `true`  | Server is in recovery, such as a standby               |
| `false` | Server is not currently in recovery, such as a primary |

### 9.2 Inspect Replication Connections on the Primary

```sql
SELECT
    application_name,
    client_addr,
    state,
    sync_state
FROM pg_stat_replication;
```

This view provides information about connected standby servers.

It is queried on the primary.

### 9.3 Inspect WAL Receiver on the Standby

```sql
SELECT
    status,
    receive_start_lsn,
    written_lsn,
    flushed_lsn,
    latest_end_lsn
FROM pg_stat_wal_receiver;
```

This view provides information about the standby's WAL receiver.

It is queried on the standby.

These views help you understand the replication setup. Detailed monitoring of replication lag, WAL retention, and failure scenarios belongs to Part 6D.

---

## 10. Common Misconceptions

### Misconception 1: Replication means sharding.

Incorrect.

Replication creates copies of data. Sharding distributes different data subsets across database servers.

### Misconception 2: Every replica can accept writes.

Incorrect.

A standard PostgreSQL physical standby is read-only while in recovery.

Logical replication subscribers have different behavior, but they are not automatically equivalent to independent writable replicas in a multi-primary system.

### Misconception 3: Replication is a backup.

Incorrect.

Accidental deletion or corruption can propagate to replicas. Backups provide separate recovery points.

### Misconception 4: Replication automatically provides zero downtime.

Incorrect.

Replication helps prepare for failover, but the system still needs failure detection, promotion, connection routing, and recovery procedures.

### Misconception 5: More replicas always mean better performance.

Incorrect.

Replicas consume resources and require replication infrastructure. They must have enough capacity to handle their assigned workload.

### Misconception 6: Replicas always contain the latest data.

Incorrect.

Replication may not be instantaneous. A replica can temporarily contain an older database state.

### Misconception 7: Replication eliminates the need for vertical scaling.

Incorrect.

You can use vertical scaling and replication together. They address different parts of the system's capacity and availability requirements.

---

## 11. Practical Example: E-Commerce Database

Imagine an e-commerce application with 1 million users.

It has these database operations:

| Operation                        | Type  | Suitable Database                    |
| -------------------------------- | ----- | ------------------------------------ |
| Register user                    | Write | Primary                              |
| Create order                     | Write | Primary                              |
| Update payment status            | Write | Primary                              |
| Update inventory                 | Write | Primary                              |
| Browse products                  | Read  | Replica                              |
| View public categories           | Read  | Replica                              |
| Generate historical sales report | Read  | Replica, if appropriate              |
| Read immediately after payment   | Read  | Primary when fresh state is required |

Architecture:

```text
                  Users
                    |
                    v
              Load Balancer
                    |
                    v
              Node.js Backend
                    |
              Database Router
               /          \
              /            \
         WRITE             READ
           |                 |
           v                 v
       Primary DB       Read Replicas
           |              /       \
           |             v         v
           |         Replica 1  Replica 2
           |
           | WAL Replication
           |
           +-------------------->
```

This architecture separates the main write workload from suitable read workloads.

As traffic grows, you can add capacity to the primary and replicas independently, subject to the replication and application architecture.

---

## 12. Practical Learning Exercise

You do not need to configure replication on your production server for this exercise. First understand the architecture and the PostgreSQL tools.

### Exercise A: Understand WAL

Run:

```sql
SHOW wal_level;
```

This displays the configured WAL level.

Common values include:

- `minimal`
- `replica`
- `logical`

The setting affects which WAL information PostgreSQL generates and what replication capabilities are available.

### Exercise B: Check Recovery Status

```sql
SELECT pg_is_in_recovery();
```

Run it on a primary or standby to understand the difference.

### Exercise C: Inspect Replication Status

On a primary:

```sql
SELECT *
FROM pg_stat_replication;
```

On a standby:

```sql
SELECT *
FROM pg_stat_wal_receiver;
```

These views may return no rows if replication is not configured or no replication connection is active.

### Exercise D: Design a Read/Write Routing Strategy

For an e-commerce backend, decide where each operation should go:

1. Create a new user.
2. Browse products.
3. Create an order.
4. Read the order immediately after creation.
5. Generate last month's sales report.
6. Update inventory after a successful payment.

Expected reasoning:

- Write operations go to the primary.
- Suitable read operations can go to replicas.
- Read-after-write operations requiring fresh data should use the primary.
- Historical reports may use replicas if their freshness requirements permit it.

---

## 13. Interview Questions

### Q1. What is database replication?

Database replication is the process of maintaining copies of database data across multiple database servers.

### Q2. Why is replication needed?

It is used to improve availability, support read scaling, maintain disaster-recovery copies, and separate certain workloads from the primary database.

### Q3. What is a primary–replica architecture?

It is an architecture where a primary database handles the main write workload and one or more replicas maintain copies of its data.

### Q4. How does PostgreSQL physical replication work?

PostgreSQL records changes in WAL. The primary sends WAL data through its WAL sender process. The standby receives it through its WAL receiver process and replays the records to maintain a physical copy.

### Q5. What is WAL?

WAL stands for Write-Ahead Logging. PostgreSQL records changes in WAL before relying on the modified data pages being written to their database files.

### Q6. What is the difference between physical and logical replication?

Physical replication transfers database changes at the physical level through WAL replay. Logical replication transfers selected logical data changes, such as changes to published tables.

### Q7. Can a PostgreSQL physical standby accept writes?

Not while it is operating as a standby in recovery. It is read-only until promoted.

### Q8. Is replication the same as backup?

No. Replication maintains copies of current data, while backups provide recoverable copies of data from particular points in time.

### Q9. How does replication help with read scaling?

Suitable read queries can be distributed across replicas instead of being executed entirely on the primary.

### Q10. Does replication distribute write operations across all replicas?

Not in a conventional primary–replica architecture. The primary handles the main write workload, and changes are propagated to replicas.

### Q11. What is failover?

Failover is the process of switching database service to another server when the current primary fails.

### Q12. What is the difference between replication and sharding?

Replication creates copies of data across servers. Sharding distributes different portions of data across servers.

### Q13. What is logical replication useful for?

It is useful when selected tables or logical data changes need to be distributed to another database, such as for reporting or integration.

### Q14. Can a replica be behind the primary?

Yes. Replication can involve a delay between a change being committed on the primary and being applied on the replica.

### Q15. Can replication replace vertical scaling?

No. Vertical scaling increases the resources of a database server, while replication creates additional copies. Both can be used together.

---

## 14. Chapter Summary

| Topic                | Key Takeaway                                              |
| -------------------- | --------------------------------------------------------- |
| Replication          | Maintains database copies across servers                  |
| Primary              | Handles the main write workload                           |
| Replica              | Maintains replicated data                                 |
| WAL                  | Records database changes and enables physical replication |
| WAL Sender           | Sends WAL data from the primary                           |
| WAL Receiver         | Receives WAL data on the standby                          |
| Physical Replication | Replicates physical database changes                      |
| Logical Replication  | Replicates selected logical data changes                  |
| Read Scaling         | Uses replicas for suitable read workloads                 |
| Failover             | Switches service to another database server               |
| Backup               | Provides independent recovery points                      |
| Sharding             | Distributes different data subsets across servers         |

### The most important mental model

```text
VERTICAL SCALING
Increase the power of one server.

REPLICATION
Create copies of data across servers.

SHARDING
Distribute different pieces of data across servers.
```

Do not confuse these three concepts. They solve different architectural problems.
