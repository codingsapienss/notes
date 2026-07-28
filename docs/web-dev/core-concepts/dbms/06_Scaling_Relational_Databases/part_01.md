---
sidebar_label: Vertical Scaling
sidebar_position: 1
---

# Vertical Scaling

## 1. Introduction

So far, we have studied how relational databases store, retrieve, index, and join data.

Now we move to a different problem:

**What happens when our database starts receiving more traffic than the current server can handle?**

Imagine you are building an e-commerce application.

Initially:

- 1,000 users use the application.
- 100 orders are created daily.
- The database runs comfortably on a small server.

A few months later:

- 100,000 users use the application.
- 10,000 orders are created daily.
- Thousands of database queries execute every minute.
- CPU and memory utilization increase.
- Query response times become slower.

Your existing database server may no longer have sufficient resources.

You need to scale the database infrastructure.

There are two fundamental approaches:

1. **Vertical Scaling (Scale Up)** — Increase the resources of an existing server.
2. **Horizontal Scaling (Scale Out)** — Add more servers and distribute the workload.

This chapter focuses on Vertical Scaling.

---

## 2. What is Vertical Scaling?

Vertical scaling means increasing the computational resources of an existing server to handle a larger workload.

Instead of adding another database server, you upgrade the machine on which the database is running.

For example:

**Before scaling**

| Resource | Configuration |
| -------- | ------------- |
| CPU      | 2 vCPUs       |
| RAM      | 4 GB          |
| Storage  | 100 GB SSD    |
| Database | PostgreSQL    |

**After vertical scaling**

| Resource | Configuration |
| -------- | ------------- |
| CPU      | 8 vCPUs       |
| RAM      | 32 GB         |
| Storage  | 1 TB SSD      |
| Database | PostgreSQL    |

The database remains on one server, but that server has more resources.

### Visual representation

```text
BEFORE SCALING

Application
     |
     v
+---------------------+
| Database Server     |
|                     |
| 2 CPU Cores         |
| 4 GB RAM            |
| 100 GB SSD          |
|                     |
| PostgreSQL          |
+---------------------+


       VERTICAL SCALING
       Upgrade Resources
              |
              v


AFTER SCALING

Application
     |
     v
+---------------------+
| Database Server     |
|                     |
| 8 CPU Cores         |
| 32 GB RAM           |
| 1 TB SSD            |
|                     |
| PostgreSQL          |
+---------------------+
```

Notice that we still have one database server.

We have increased its capacity, not distributed the database across multiple servers.

### Other names

Vertical scaling is also called:

- Scale Up
- Scaling Up
- Server Upgrading
- Resource Scaling

---

## 3. Which resources can we increase?

Vertical scaling can involve upgrading several hardware resources.

### 3.1 CPU

CPU is responsible for executing database operations.

Examples include:

- Query execution.
- JOIN processing.
- Sorting.
- Aggregations.
- Index operations.
- Transaction processing.

Suppose your database frequently performs complex analytical queries:

```sql
SELECT
    user_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS revenue
FROM orders
GROUP BY user_id
ORDER BY revenue DESC;
```

These operations require CPU resources.

If the CPU is consistently overloaded, upgrading the CPU can improve the database's ability to process queries concurrently.

However, more CPU cores do not guarantee that every individual query becomes proportionally faster.

Some operations are parallelizable; others have serial portions or other bottlenecks.

### 3.2 RAM

RAM stores data and intermediate results that the database can access without repeatedly reading from disk.

PostgreSQL uses memory for:

- Shared buffers.
- Query execution.
- Sorting.
- Hash joins.
- Aggregations.
- Connection and backend processes.
- Operating-system filesystem caching.

Suppose your database has frequently accessed data and indexes.

If the working set fits in memory, the database can avoid many disk reads.

Increasing RAM can improve performance when memory pressure is the bottleneck.

Example:

```text
BEFORE

RAM: 4 GB

Frequently accessed data:
10 GB

Much of the working set cannot remain
in memory simultaneously.


AFTER

RAM: 32 GB

Frequently accessed data:
10 GB

More of the working set can remain
in memory.
```

This can improve cache hit rates and reduce disk I/O.

**Important:** More RAM does not automatically mean PostgreSQL will use all of it for caching. Database configuration and operating-system memory management also matter.

### 3.3 Storage

Storage is responsible for persisting database files.

Database storage contains:

- Table data.
- Indexes.
- Transaction-related files.
- WAL (Write-Ahead Log).
- Temporary files.
- Other database metadata.

Storage performance depends on several factors:

| Factor     | Meaning                               |
| ---------- | ------------------------------------- |
| Capacity   | How much data can be stored           |
| IOPS       | Input/output operations per second    |
| Throughput | Amount of data transferred per second |
| Latency    | Time required for an I/O operation    |

Suppose your database uses a slow disk.

Even if the CPU and RAM are sufficient, queries that require many disk operations can remain slow.

Upgrading to faster SSD or NVMe storage can improve I/O-intensive workloads.

### 3.4 Network capacity

Database servers communicate with application servers and other infrastructure.

If network bandwidth or latency becomes a bottleneck, upgrading network capacity may help.

However, network scaling is not necessarily the same as increasing database compute resources.

The actual solution depends on whether the bottleneck is:

- Network bandwidth.
- Network latency.
- Excessive data transfer.
- Connection management.
- Database processing.

---

## 4. Why does Vertical Scaling work?

The basic idea is simple:

A more powerful machine can process more work.

Consider a database server handling:

- User authentication queries.
- Product queries.
- Order creation.
- Payment updates.
- Reporting queries.

As traffic increases, these operations compete for server resources.

A machine with more CPU, RAM, and faster storage can handle a larger workload before reaching resource limits.

### Example

Suppose an application has the following database workload:

| Metric                  | Initial server |
| ----------------------- | -------------: |
| CPU cores               |              2 |
| RAM                     |           4 GB |
| Average CPU utilization |            85% |
| Average RAM utilization |            90% |
| Database connections    |             80 |
| Average query latency   |         180 ms |

After upgrading:

| Metric                  | Upgraded server |
| ----------------------- | --------------: |
| CPU cores               |               8 |
| RAM                     |           32 GB |
| Average CPU utilization |             35% |
| Average RAM utilization |             55% |
| Database connections    |              80 |
| Average query latency   |           60 ms |

These are illustrative values, not guaranteed scaling results.

The improvement depends on whether CPU and memory were actually limiting performance.

If the real problem was a missing index or inefficient query, upgrading the server might only provide temporary relief.

---

## 5. Vertical Scaling in PostgreSQL

Let's understand how vertical scaling affects a PostgreSQL deployment.

Imagine PostgreSQL is running on a virtual machine.

```text
APPLICATION SERVER
        |
        | SQL Queries
        v
+--------------------------+
| PostgreSQL Server        |
|                          |
| CPU                      |
| RAM                      |
| Storage                  |
|                          |
| Database                 |
| - users                  |
| - orders                 |
| - products               |
| - payments               |
+--------------------------+
```

You can upgrade the VM's resources without changing the database schema or application queries.

For example:

**Initial VM**

```text
2 vCPUs
4 GB RAM
100 GB SSD
```

**Upgraded VM**

```text
8 vCPUs
32 GB RAM
500 GB SSD
```

PostgreSQL continues to run as the same database instance.

The application can continue connecting through the same database endpoint if the infrastructure upgrade preserves it.

However, cloud infrastructure upgrades may require a restart, maintenance window, or migration depending on the provider and VM configuration.

---

## 6. PostgreSQL configuration and vertical scaling

Increasing server resources is only one part of scaling.

The database must also be configured appropriately.

Some important PostgreSQL configuration parameters include:

### 6.1 shared_buffers

`shared_buffers` controls the amount of memory PostgreSQL uses for its shared buffer cache.

Example:

```sql
SHOW shared_buffers;
```

A possible configuration:

```conf
shared_buffers = 8GB
```

This is only an example. The correct value depends on available RAM, workload, and other system requirements.

### 6.2 work_mem

`work_mem` controls the memory available to certain query operations, such as:

- Sort operations.
- Hash joins.
- Hash-based aggregation.

Check its value:

```sql
SHOW work_mem;
```

Example:

```conf
work_mem = 16MB
```

**Important:** `work_mem` is not a single global memory pool shared by the entire database.

Multiple operations and concurrent queries can each consume memory.

Setting it too high can cause memory exhaustion under heavy concurrency.

### 6.3 maintenance_work_mem

This parameter controls memory available for certain maintenance operations, including index creation and VACUUM operations.

Check it:

```sql
SHOW maintenance_work_mem;
```

Example:

```conf
maintenance_work_mem = 512MB
```

### 6.4 max_connections

This controls the maximum number of simultaneous database connections.

```sql
SHOW max_connections;
```

Increasing server RAM does not mean you should blindly increase `max_connections`.

Each connection has resource overhead.

Too many connections can cause:

- Memory pressure.
- Context switching.
- CPU contention.
- Increased connection-management overhead.

Applications commonly use connection pooling to manage this problem.

### 6.5 Effective cache size

```sql
SHOW effective_cache_size;
```

This setting helps PostgreSQL estimate how much memory may be available for caching data through PostgreSQL shared buffers and the operating system.

It does not allocate memory itself.

### Important distinction

Hardware upgrades and database configuration are related, but they are not the same thing.

| Hardware scaling          | Database tuning                        |
| ------------------------- | -------------------------------------- |
| Increase CPU cores        | Adjust query execution settings        |
| Increase RAM              | Configure memory-related parameters    |
| Upgrade SSD               | Tune storage-related behavior          |
| Increase network capacity | Optimize connections and data transfer |

A powerful machine with poor database configuration can still perform badly.

---

## 7. Advantages of Vertical Scaling

### 7.1 Simpler architecture

You do not need to distribute database responsibilities across multiple servers.

Your architecture can remain:

```text
Application
    |
    v
PostgreSQL
    |
    v
Single Database Server
```

This is easier to operate than a distributed database architecture.

### 7.2 Minimal application changes

Your application can continue using the same database connection pattern.

For example:

```javascript
const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
```

You do not need to implement shard routing or distributed query coordination merely because you upgraded the database server.

### 7.3 No application-level sharding logic

You do not need to decide which database server stores a particular user or order.

The database remains in one location.

### 7.4 Easier transactions

Transactions that operate within the same PostgreSQL database can continue using the normal transaction model.

You do not need to coordinate transactions across multiple independent database shards.

### 7.5 Easier administration

Backup, monitoring, schema migrations, and maintenance can remain relatively straightforward compared with a distributed database deployment.

---

## 8. Disadvantages of Vertical Scaling

Vertical scaling is useful, but it has limitations.

### 8.1 Hardware limits

A single server cannot be upgraded indefinitely.

Every machine has limits on:

- CPU capacity.
- RAM capacity.
- Storage capacity.
- Network bandwidth.
- I/O performance.

Eventually, you may reach the maximum available machine configuration.

### 8.2 Increasing cost

More powerful servers generally cost more.

For example:

| Server             | Monthly cost (illustrative) |
| ------------------ | --------------------------: |
| 2 vCPU, 4 GB RAM   |                      ₹3,000 |
| 4 vCPU, 8 GB RAM   |                      ₹6,000 |
| 8 vCPU, 32 GB RAM  |                     ₹18,000 |
| 16 vCPU, 64 GB RAM |                     ₹40,000 |

These are hypothetical prices to illustrate the cost trend, not actual cloud-provider quotes.

As the workload grows, the cost of a single powerful machine can become significant.

### 8.3 Single point of failure

This is one of the biggest limitations.

If your only database server goes down, the application may lose access to its database.

Example:

```text
Application
    |
    v
+-------------------+
| PostgreSQL        |
| Single Server     |
+-------------------+
          |
          X
       FAILURE
```

The entire database service becomes unavailable unless you have a separate recovery or failover setup.

**Important:** Vertical scaling does not automatically provide high availability.

You can still add replication and failover to a vertically scaled database, but those are separate architectural capabilities.

### 8.4 Downtime during upgrades

Some infrastructure upgrades require restarting the database server or migrating it to another machine.

During this process, database connections may be interrupted.

The exact downtime depends on the infrastructure provider and upgrade method.

### 8.5 Diminishing returns

Doubling CPU or RAM does not necessarily double application performance.

For example:

- A query may be waiting on disk I/O.
- A query may be inefficient.
- A database may be limited by lock contention.
- A workload may be constrained by serial execution.
- The application may be waiting on network latency.

If the bottleneck is not the resource being upgraded, additional capacity may provide little improvement.

---

## 9. Vertical Scaling vs Horizontal Scaling

This is an important comparison.

### Vertical Scaling

Increase the resources of an existing server.

```text
BEFORE

+-------------------+
| Database Server   |
| 2 CPU             |
| 4 GB RAM          |
+-------------------+

        |
        v

AFTER

+-------------------+
| Database Server   |
| 8 CPU             |
| 32 GB RAM         |
+-------------------+
```

### Horizontal Scaling

Add more servers to distribute the workload.

```text
BEFORE

        Application
             |
             v
       Database Server


AFTER

             |
        +----+----+
        |         |
        v         v
    Database  Database
     Server A  Server B
```

This is only a conceptual representation. Horizontal database scaling can be implemented using replication, sharding, distributed SQL, or other architectures. Simply adding two database servers does not automatically distribute writes or data.

### Comparison

| Feature                | Vertical Scaling                      | Horizontal Scaling                         |
| ---------------------- | ------------------------------------- | ------------------------------------------ |
| Meaning                | Upgrade existing server               | Add more servers                           |
| Hardware               | More powerful machine                 | Multiple machines                          |
| Architecture           | Relatively simple                     | More complex                               |
| Application changes    | Usually minimal                       | May be required                            |
| Maximum capacity       | Limited by machine size               | Can grow across machines                   |
| Cost                   | Can become expensive at high capacity | Depends on infrastructure and coordination |
| Fault tolerance        | Not automatic                         | Not automatic                              |
| Data distribution      | Usually one database instance         | May be replicated or partitioned           |
| Operational complexity | Generally lower                       | Generally higher                           |

### Important misconception

Horizontal scaling does not automatically mean sharding.

You can horizontally scale a relational database using replication without splitting the data.

We will study replication in Part 6B and later study sharding in Part 7.

---

## 10. When should you use Vertical Scaling?

Vertical scaling is often a good first step when:

### Scenario 1: Early-stage application

Your application is growing, but the workload is still manageable on one database server.

A more powerful server may be the simplest solution.

### Scenario 2: Database workload is resource-constrained

Monitoring indicates:

- High CPU utilization.
- Memory pressure.
- High disk latency.
- Insufficient storage capacity.

Upgrading the relevant resource may help.

### Scenario 3: Distributed architecture is unnecessary

Your application does not yet require multiple database servers or complex data distribution.

You can avoid introducing unnecessary operational complexity.

### Scenario 4: Application requires straightforward transactional behavior

A single relational database instance may be sufficient for the current workload.

There is no reason to introduce sharding before it is needed.

---

## 11. When should you NOT rely only on Vertical Scaling?

Vertical scaling is not always the correct solution.

### Scenario 1: Query optimization problems

Suppose this query is slow:

```sql
SELECT *
FROM orders
WHERE user_id = 100;
```

And `orders.user_id` has no suitable index.

The database may perform a full table scan.

Buying a more powerful server might help temporarily, but creating an appropriate index may be a better solution.

### Scenario 2: Excessive database connections

Suppose your Node.js application opens hundreds or thousands of connections.

Increasing CPU and RAM may not solve the underlying connection-management problem.

Use a properly configured connection pool.

### Scenario 3: Read-heavy workload

Suppose your database receives:

- 100 write queries per second.
- 10,000 read queries per second.

You may eventually want to distribute read traffic across replicas rather than continually upgrading one server.

Replication is covered in Part 6B.

### Scenario 4: Single-server availability requirements

If the application requires high availability, simply upgrading one database server is insufficient.

You need an availability strategy involving backup, replication, failover, or managed database capabilities.

### Scenario 5: The server has reached its practical limits

If the workload exceeds the capacity of the largest reasonable server, you may need horizontal scaling.

---

## 12. Real-world example: Scaling an e-commerce database

Imagine an e-commerce application built with:

- Node.js.
- Express.
- PostgreSQL.
- Redis.
- Nginx.

Initially, the application has:

```text
1000 daily users
100 daily orders
2 vCPU
4 GB RAM
```

The architecture:

```text
Users
  |
  v
Nginx
  |
  v
Node.js Application
  |
  +------> Redis
  |
  +------> PostgreSQL
```

As the application grows:

```text
100,000 daily users
10,000 daily orders
```

The database starts showing:

- High CPU utilization.
- Increased query latency.
- Memory pressure.
- Increased disk I/O.

### Step 1: Investigate the bottleneck

Use monitoring tools and PostgreSQL statistics.

For example:

```sql
SELECT
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit
FROM pg_stat_database;
```

Check active queries:

```sql
SELECT
    pid,
    state,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity
WHERE state <> 'idle';
```

Inspect expensive queries:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 100;
```

### Step 2: Optimize before upgrading

Potential improvements:

- Add missing indexes.
- Fix inefficient queries.
- Reduce unnecessary database calls.
- Use connection pooling.
- Cache frequently accessed data where appropriate.
- Avoid retrieving unnecessary columns.

### Step 3: Upgrade server resources

Suppose the database still needs more capacity.

Upgrade:

```text
BEFORE

2 vCPU
4 GB RAM
100 GB SSD


AFTER

8 vCPU
32 GB RAM
500 GB SSD
```

### Step 4: Monitor again

Check:

- CPU utilization.
- RAM usage.
- Disk IOPS.
- Query latency.
- Database connections.
- Transaction throughput.
- Cache hit rates.

If the database now handles the workload comfortably, vertical scaling may be sufficient.

If the workload continues growing, consider replication or other scaling architectures.

**Important lesson:** Diagnose the bottleneck first. Scaling should address the actual constraint rather than blindly increasing server resources.

---

## 13. How cloud providers support Vertical Scaling

Cloud providers commonly allow you to change the size of a virtual machine or managed database instance.

Examples include:

- AWS EC2 and Amazon RDS.
- Azure Virtual Machines and Azure Database for PostgreSQL.
- Google Compute Engine and Cloud SQL.

### Example: Azure VM

Suppose PostgreSQL runs on an Azure VM.

Initial configuration:

```text
2 vCPUs
4 GB RAM
```

You can resize the VM to a larger size with more CPU and memory.

The exact process depends on the VM family and available hardware.

Some resize operations require deallocation or a restart.

### Example: Managed PostgreSQL

A managed database provider may allow you to upgrade:

- Compute tier.
- vCPU count.
- RAM.
- Storage capacity.
- Storage performance.

The provider manages much of the infrastructure, but you still need to understand workload characteristics and database configuration.

---

## 14. Common misconceptions

### Misconception 1: Vertical scaling means adding more servers

Incorrect.

Vertical scaling means upgrading the resources of an existing server.

Adding more servers is horizontal scaling.

### Misconception 2: Vertical scaling solves every performance problem

Incorrect.

It cannot automatically fix:

- Poor SQL queries.
- Missing indexes.
- Lock contention.
- Excessive connections.
- Inefficient application architecture.

### Misconception 3: More CPU cores always make queries faster

Incorrect.

Some operations cannot fully use all available cores. Query performance also depends on memory, I/O, locking, and execution strategy.

### Misconception 4: More RAM automatically makes PostgreSQL faster

Incorrect.

RAM helps when memory availability is a bottleneck. It must also be configured and used appropriately.

### Misconception 5: Vertical scaling provides high availability

Incorrect.

A single upgraded database server can still fail.

High availability requires a separate architecture and recovery strategy.

### Misconception 6: Horizontal scaling is always better

Incorrect.

Distributed databases introduce complexity.

For many applications, one properly configured and vertically scaled relational database is sufficient.

### Misconception 7: We should shard as soon as traffic increases

Incorrect.

Sharding introduces data distribution, routing, cross-shard query, and operational challenges.

First optimize the existing system and understand whether vertical scaling or replication is sufficient.

---

## 15. Interview Questions

### Basic questions

**1. What is Vertical Scaling?**

Vertical scaling means increasing the resources of an existing server, such as CPU, RAM, and storage capacity.

**2. What is another name for Vertical Scaling?**

Scale Up.

**3. What is the difference between Vertical Scaling and Horizontal Scaling?**

Vertical scaling upgrades an existing server. Horizontal scaling adds more servers to distribute workload.

**4. Which resources can be increased through Vertical Scaling?**

CPU, RAM, storage capacity, storage performance, and potentially network capacity.

**5. Does Vertical Scaling require application changes?**

Usually not. The application can often continue using the same database endpoint and connection logic.

### Intermediate questions

**6. What are the main disadvantages of Vertical Scaling?**

- Hardware limits.
- Increasing costs.
- Potential upgrade downtime.
- Single-server failure risk.
- Diminishing returns.

**7. Why does Vertical Scaling not guarantee high availability?**

Because the application still depends on a single database server unless replication or another failover architecture is implemented.

**8. When would you choose Vertical Scaling over Horizontal Scaling?**

When one server can handle the workload, infrastructure simplicity matters, and distributed architecture is not yet necessary.

**9. Does increasing RAM always improve database performance?**

No. It helps when memory pressure or caching is a bottleneck.

**10. Why should we optimize queries before upgrading database hardware?**

Because inefficient queries and missing indexes can waste resources. Hardware upgrades may hide the problem temporarily without fixing it.

**11. Can PostgreSQL use multiple CPU cores?**

Yes. PostgreSQL can execute multiple concurrent backend processes and can use parallel query execution for supported operations. Not every query scales linearly with additional cores.

**12. What is the difference between scaling and optimization?**

Scaling increases available capacity. Optimization improves how efficiently existing resources are used.

---

## 16. Chapter Summary

| Concept            | Key takeaway                                           |
| ------------------ | ------------------------------------------------------ |
| Vertical Scaling   | Increase resources of an existing server               |
| Scale Up           | Another name for vertical scaling                      |
| CPU                | Helps with query processing and computation            |
| RAM                | Supports caching and memory-intensive operations       |
| Storage            | Affects capacity, IOPS, throughput, and latency        |
| Database tuning    | Configures PostgreSQL to use resources effectively     |
| Advantages         | Simpler architecture and minimal application changes   |
| Disadvantages      | Hardware limits, cost, downtime, single-server risk    |
| Horizontal Scaling | Add servers to distribute workload                     |
| High Availability  | Requires a separate availability and recovery strategy |

### Key takeaways

1. Vertical scaling means upgrading an existing database server.
2. CPU, RAM, and storage are common upgrade targets.
3. PostgreSQL configuration should be appropriate for the available resources.
4. More hardware does not automatically solve inefficient queries.
5. Vertical scaling is usually simpler than distributed database architectures.
6. A single database server remains a potential single point of failure.
7. Vertical scaling has practical hardware and cost limits.
8. Diagnose performance bottlenecks before upgrading infrastructure.
9. Horizontal scaling becomes relevant when one server is no longer sufficient or other requirements demand distribution.
