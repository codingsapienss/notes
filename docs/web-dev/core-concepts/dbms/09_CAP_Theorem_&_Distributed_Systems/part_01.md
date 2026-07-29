---
sidebar_label: Distributed Systems Fundamentals
sidebar_position: 1
---

# Distributed Systems Fundamentals

## 1. Introduction: What Is a Distributed System?

Until now, we have studied databases running on individual servers, replication, sharding, and horizontal scaling.

These concepts introduce an important architectural idea: **multiple independent computers working together to provide one application or service.**

This is the foundation of distributed systems.

A distributed system is a collection of independent computers (called nodes) that communicate over a network and coordinate their operations to accomplish a common task.

Each computer has its own:

- CPU
- Memory
- Operating system
- Storage
- Network interface
- Processes

These computers communicate through network messages.

From the user's perspective, they may appear to be one application.

### Example: A Single-Server Application

Consider a basic Node.js application:

```text
             Client
                |
                v
          Node.js Server
                |
                v
           PostgreSQL
```

The backend and database may run on the same machine or on separate machines, but the application has a relatively simple architecture.

### Example: A Distributed Application

Now consider a larger application:

```text
                  CLIENTS
                     |
                     v
                Load Balancer
                     |
          -----------------------
          |          |          |
          v          v          v
       Server 1   Server 2   Server 3
          |          |          |
          ------------          |
                |               |
                v               v
              Redis         Database Cluster
```

Multiple backend servers handle requests.

The database may also consist of multiple nodes.

These systems communicate through a network and coordinate their work.

This is a distributed system.

### Real-World Examples

- <Entity value="Google" category="company" disambig="Technology company" /> operates services across large distributed infrastructure.
- <Entity value="Netflix" category="company" disambig="Streaming technology company" /> uses distributed services to deliver streaming content.
- <Entity value="Amazon" category="company" disambig="E-commerce and cloud computing company" /> operates large distributed commerce and cloud systems.
- <Entity value="Uber" category="company" disambig="Ride-hailing and mobility technology company" /> coordinates riders, drivers, trips, and location services.
- <Entity value="WhatsApp" category="software" disambig="Messaging application" /> handles messaging across distributed infrastructure.

The common idea is that multiple computers cooperate to provide a service.

---

## 2. Why Do We Need Distributed Systems?

Why not run everything on one powerful server?

Because a single server has practical limitations.

### 2.1 Scalability

Suppose your application receives 100 requests per second.

One server may handle the workload comfortably.

But what happens when traffic increases to 100,000 requests per second?

A single server may no longer provide sufficient capacity.

We can distribute requests across multiple servers.

```text
             Incoming Requests
                    |
                    v
               Load Balancer
                    |
          -----------------------
          |          |          |
          v          v          v
       Server 1   Server 2   Server 3
```

Each server handles part of the workload.

This is horizontal scaling.

### 2.2 Availability

Suppose your application runs on one server.

If that server crashes, the entire application may become unavailable.

```text
          Application Server
                  |
                  X
               CRASHED
```

Now introduce multiple application servers.

```text
               Load Balancer
                     |
          -----------------------
          |          |          |
          v          v          v
       Server 1   Server 2   Server 3
          |
          X
       CRASHED

       Server 2 and Server 3
       continue serving requests.
```

If the load balancer detects the failure and routes traffic to healthy servers, the application can remain available.

### 2.3 Fault Tolerance

Fault tolerance is the ability of a system to continue operating, possibly with reduced functionality, when some components fail.

For example:

- One application server crashes.
- A database replica becomes unavailable.
- A network connection fails.
- A service stops responding.

A fault-tolerant system is designed to handle such failures without bringing down the entire application.

### 2.4 Geographic Distribution

Suppose an application serves users in:

- India
- Europe
- North America

Running every component in one geographical region may introduce significant network latency for distant users.

A distributed architecture can place infrastructure closer to users.

```text
                Global Application
                        |
             ----------------------
             |          |         |
             v          v         v
           India      Europe     USA
           Region     Region    Region
```

This can reduce latency and improve regional availability.

However, distributing data geographically introduces consistency, replication, and coordination challenges.

### 2.5 Resource and Workload Separation

Different workloads may require different infrastructure.

For example:

| Workload         | Possible Infrastructure |
| ---------------- | ----------------------- |
| API requests     | Application servers     |
| Database queries | Database servers        |
| Background jobs  | Worker servers          |
| Caching          | Redis                   |
| Search           | Search cluster          |
| Analytics        | Analytical database     |

Instead of forcing one server to handle everything, responsibilities can be distributed.

---

## 3. What Is a Node?

A node is an individual computer or computing instance participating in a distributed system.

A node can be:

- A physical server.
- A virtual machine.
- A cloud instance.
- A containerized service instance.
- A database server.

Example:

```text
Distributed System
       |
       |--------------------
       |         |         |
       v         v         v
     Node 1    Node 2    Node 3
```

Each node can execute processes and communicate with other nodes.

### 3.1 Node Failure

A node may fail because of:

- Hardware failure.
- Operating system crash.
- Application crash.
- Out-of-memory condition.
- Network disconnection.
- Power failure.
- Configuration error.

The system must account for the possibility that a node may stop working at any time.

### 3.2 Node Identity

Distributed systems need to identify their participating nodes.

For example:

```text
node-1
node-2
node-3
```

A database cluster may use node identities to coordinate replication, membership, or data ownership.

Node identity becomes especially important in distributed ID generation and consensus protocols.

---

## 4. What Is a Cluster?

A cluster is a group of connected nodes working together to provide a service.

Example:

```text
              Database Cluster
                     |
          -----------------------
          |          |          |
          v          v          v
        Node 1     Node 2     Node 3
```

A cluster can be configured for different purposes.

### 4.1 Application Cluster

Multiple application instances serve requests.

```text
               Load Balancer
                     |
          -----------------------
          |          |          |
          v          v          v
       Node 1     Node 2     Node 3
       Node.js    Node.js    Node.js
```

The nodes may run the same application code.

### 4.2 Database Cluster

Multiple database nodes cooperate to store, replicate, or distribute data.

For example, a primary-replica architecture:

```text
              Database Cluster
                     |
                  Primary
                     |
             ----------------
             |              |
             v              v
          Replica 1      Replica 2
```

### 4.3 Worker Cluster

Background jobs are distributed across multiple worker nodes.

```text
                Job Queue
                    |
          -----------------------
          |          |          |
          v          v          v
        Worker 1  Worker 2   Worker 3
```

Each worker processes jobs independently.

### 4.4 Cluster Does Not Automatically Mean Distributed Database

This distinction matters.

A cluster of Node.js servers is a distributed application architecture.

It does not necessarily mean the application uses a distributed database.

Similarly, a database cluster may replicate data without sharding it.

The architecture depends on what the nodes actually do.

---

## 5. How Do Nodes Communicate?

Distributed systems depend on network communication.

Unlike two functions executing inside the same process, two nodes must exchange messages over a network.

### 5.1 Local Function Call

Consider:

```javascript
function calculateTotal(price, quantity) {
  return price * quantity;
}

const total = calculateTotal(100, 2);
```

The function call occurs within the same application process.

Communication is relatively direct.

### 5.2 Network Communication

Now suppose one Node.js service needs data from another service.

```text
Service A
    |
    | HTTP Request
    |
    v
Service B
    |
    v
Response
```

Example:

```javascript
const response = await fetch("http://inventory-service/api/products/101");

const product = await response.json();
```

The request travels over a network.

This introduces additional possibilities:

- Network latency.
- Connection failures.
- Timeouts.
- DNS problems.
- Service unavailability.
- Partial responses.
- Duplicate requests after retries.

A network request is fundamentally less predictable than a local function call.

### 5.3 Common Communication Mechanisms

| Mechanism       | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| HTTP/HTTPS      | Communication between services and clients           |
| REST APIs       | Resource-oriented service communication              |
| gRPC            | Efficient service-to-service communication using RPC |
| WebSockets      | Persistent two-way communication                     |
| Message Queues  | Asynchronous message delivery                        |
| Event Streaming | Publishing and consuming continuous event streams    |

### 5.4 Synchronous Communication

In synchronous request-response communication, the caller waits for a response.

Example:

```text
Service A
    |
    | Request
    v
Service B
    |
    | Response
    v
Service A continues
```

HTTP APIs are a common example.

Advantages:

- Simple request-response model.
- Immediate response when the dependency is healthy.
- Easy to understand and debug initially.

Disadvantages:

- Caller depends on the availability of the receiver.
- Latency accumulates across multiple calls.
- Timeouts and failures can propagate.

### 5.5 Asynchronous Communication

In asynchronous communication, the sender publishes a message and does not need to wait for the receiver to finish processing it.

Example:

```text
Order Service
      |
      v
 Message Queue
      |
      v
Notification Worker
```

The order service publishes an event.

The notification worker processes it later.

Advantages:

- Reduces direct runtime dependency.
- Supports background processing.
- Helps absorb traffic spikes.
- Allows independent service execution.

Disadvantages:

- Processing may be delayed.
- Messages may be delivered more than once.
- Ordering and retries need consideration.
- Debugging becomes more complex.

---

## 6. Network Latency

Network latency is the time required for data to travel between two endpoints.

Consider:

```text
Service A ---------------- Service B
```

If Service A sends a request and receives a response after 40 milliseconds, the request-response round-trip time is approximately 40 milliseconds.

This is network-related latency plus processing and other overhead.

### 6.1 Why Does Latency Matter?

Suppose one API request calls four services sequentially.

| Operation         |   Time |
| ----------------- | -----: |
| User service      |  30 ms |
| Inventory service |  50 ms |
| Payment service   | 100 ms |
| Order service     |  40 ms |
| Total             | 220 ms |

Ignoring additional overhead, the total is approximately 220 milliseconds.

Sequential dependencies add latency.

### 6.2 Parallel Requests

Some independent operations can execute in parallel.

```javascript
const [user, inventory, recommendations] = await Promise.all([
  getUser(userId),
  getInventory(productId),
  getRecommendations(userId),
]);
```

If the requests execute concurrently, the overall waiting time may be closer to the slowest operation rather than the sum of all three.

However, parallel execution introduces additional concerns:

- One rejection can cause `Promise.all` to reject.
- The application must decide how to handle partial results.
- Every request still consumes resources.
- The slowest dependency may determine response latency.

### 6.3 Latency Is Not the Same as Throughput

**Latency:** How long one operation takes.

**Throughput:** How many operations a system processes per unit of time.

Example:

| Metric             | Meaning                                    |
| ------------------ | ------------------------------------------ |
| 50 ms latency      | One request takes approximately 50 ms      |
| 5,000 requests/sec | System processes 5,000 requests per second |

A system can have high throughput but also high latency.

It can also have low latency at a low request rate.

Both metrics matter.

---

## 7. Partial Failures

This is one of the most important concepts in distributed systems.

### 7.1 What Is a Partial Failure?

A partial failure occurs when some components of a distributed system fail while other components continue operating.

Consider:

```text
               Application
                    |
          -----------------------
          |          |          |
          v          v          v
       Service A  Service B  Service C
          |          |          |
          v          X          v
       Working    Failed     Working
```

Service B fails, but Services A and C continue running.

The entire system is not necessarily down.

However, some operations may fail.

### 7.2 Real-World Example

Suppose an e-commerce application has:

- User Service.
- Order Service.
- Payment Service.
- Notification Service.

A customer places an order.

The following happens:

1. User validation succeeds.
2. Order creation succeeds.
3. Payment processing succeeds.
4. Notification service becomes unavailable.

Should the order be cancelled?

Usually not.

The core business operation may already be complete.

The notification can be retried asynchronously.

This illustrates why systems need failure handling at the operation level rather than assuming every component succeeds or fails together.

### 7.3 Partial Failure vs Complete Failure

| Complete Failure                   | Partial Failure                                |
| ---------------------------------- | ---------------------------------------------- |
| Entire system becomes unavailable  | Some components remain operational             |
| Easier to identify at a high level | More difficult to detect and diagnose          |
| All dependent operations may fail  | Some operations may still succeed              |
| One broad failure state            | Different components may have different states |

### 7.4 Why Partial Failures Are Difficult

Suppose Service A sends a request to Service B.

The request times out.

There are several possibilities:

1. Service B never received the request.
2. Service B received it but failed before processing.
3. Service B processed it but failed before responding.
4. Service B sent a response, but the response was lost.
5. The response is simply delayed.

Service A cannot always determine what happened from a timeout alone.

This uncertainty is fundamental to distributed systems.

---

## 8. Network Partitions

### 8.1 What Is a Network Partition?

A network partition occurs when communication between groups of nodes becomes unavailable or unreliable.

The nodes may still be running, but they cannot communicate with each other.

Example:

```text
        Group A                 Group B

       Node 1                  Node 3
          |                       |
       Node 2                  Node 4

          X X X X X X X X X
             NETWORK
             PARTITION
```

Nodes in Group A can communicate with each other.

Nodes in Group B can communicate with each other.

But communication between the groups is interrupted.

### 8.2 Important Distinction

A network partition does not necessarily mean the servers have crashed.

The machines may be healthy.

Their network communication is the problem.

### 8.3 Why Is This Dangerous?

Suppose a distributed database has three nodes.

```text
Node 1
Node 2
Node 3
```

A network partition separates Node 1 from Nodes 2 and 3.

Both sides may receive requests.

The system must decide:

- Should both sides continue accepting writes?
- Should one side reject writes?
- How should conflicting updates be handled?
- How should the nodes reconcile data after communication returns?

These decisions involve consistency and availability tradeoffs.

This leads directly to the CAP theorem, which we will study in Part 9B.

---

## 9. Fault Tolerance

### 9.1 What Is Fault Tolerance?

Fault tolerance is the ability of a system to continue providing its intended service when some components fail.

It does not necessarily mean every operation continues successfully.

A system may remain partially functional or operate with reduced capacity.

### 9.2 Redundancy

Redundancy means having additional resources or components that can take over when another component fails.

Example:

```text
              Load Balancer
                    |
          ---------------------
          |          |        |
          v          v        v
       Server 1   Server 2  Server 3
          |
          X
        FAILED

       Other servers continue.
```

Redundancy can be introduced at multiple levels:

- Application servers.
- Database replicas.
- Network paths.
- Storage systems.
- Availability zones.
- Message brokers.

### 9.3 Failover

Failover means switching operations from a failed component to another available component.

Database example:

```text
Before:

Primary DB
    |
    v
Replica DB


Primary Fails:

Replica DB
    |
    v
Promoted to Primary
```

The exact failover process depends on the database and its replication architecture.

Failover may involve:

- Failure detection.
- Selecting a suitable replacement.
- Promoting a replica.
- Updating routing.
- Reconnecting application clients.

### 9.4 Redundancy Does Not Guarantee Fault Tolerance

Having multiple servers is not enough.

Consider:

```text
Server 1 ----\
              \
               Shared Network Switch
              /
Server 2 ----/
```

If both servers depend on the same network switch and that switch fails, both servers may become unreachable.

This is a shared failure dependency.

A well-designed system must identify and reduce single points of failure.

---

## 10. Availability

### 10.1 What Is Availability?

Availability measures the proportion of time a system is operational and accessible.

A common formula is:

\[
Availability =
\frac{Uptime}{Uptime + Downtime}
\times 100
\]

For example:

If a service is operational for 99 hours and unavailable for 1 hour:

\[
Availability =
\frac{99}{100}\times100 = 99\%
\]

### 10.2 Common Availability Targets

| Availability | Approximate Downtime per 30-Day Month |
| ------------ | ------------------------------------: |
| 99%          |                   7 hours, 12 minutes |
| 99.9%        |                43 minutes, 12 seconds |
| 99.99%       |                 4 minutes, 19 seconds |
| 99.999%      |                            26 seconds |

These are approximate values based on a 30-day month.

### 10.3 What Is an SLA?

An SLA (Service Level Agreement) is a formal agreement describing expected service levels.

For example:

A service provider may commit to 99.9% monthly availability.

Availability targets should be defined using measurable service indicators and a clear measurement period.

### 10.4 How Do Distributed Systems Improve Availability?

Possible techniques:

- Multiple application instances.
- Database replication.
- Load balancing.
- Automated failover.
- Geographic redundancy.
- Health checks.
- Graceful degradation.

However, adding nodes does not automatically guarantee higher availability.

The system must be designed to detect and recover from failures.

---

## 11. Consistency in Distributed Systems

### 11.1 What Does Consistency Mean?

In a distributed system, consistency concerns whether different nodes and clients observe data according to the system's defined rules.

Consider a replicated database:

```text
Primary:
balance = 5000

Replica:
balance = 4500
```

The primary has processed a new update, but the replica has not received or applied it yet.

The nodes temporarily contain different values.

This is replication lag.

### 11.2 Strong Consistency

Under a strong consistency guarantee, reads observe the latest committed write according to the system's defined consistency model.

Example:

```text
Write:
balance = 5000

Subsequent Read:
balance = 5000
```

### 11.3 Eventual Consistency

Under eventual consistency, replicas may temporarily disagree but are expected to converge if updates stop and replication succeeds.

Example:

```text
Time 1:

Node 1: ACTIVE
Node 2: INACTIVE

Time 2:

Node 1: ACTIVE
Node 2: ACTIVE
```

### 11.4 Consistency Is Not the Same as Availability

A system can be available while returning stale data.

A system can preserve stronger consistency by refusing certain operations when coordination is unavailable.

These tradeoffs are central to distributed database design.

We will study them in detail in Part 9B.

---

## 12. Replication in Distributed Systems

Replication means maintaining copies of data across multiple nodes.

Consider:

```text
              Primary Node
                    |
           ------------------
           |                |
           v                v
        Replica 1        Replica 2
```

### Why Replicate Data?

1. Improve availability.
2. Support failover.
3. Distribute eligible read requests.
4. Maintain copies across locations.
5. Support recovery from certain infrastructure failures.

### Primary-Replica Replication

In a common architecture:

- Primary handles writes.
- Replicas receive changes.
- Eligible reads can be served by replicas.

### Replication Challenge

Suppose the primary receives a write.

```text
Primary:
status = PAID
```

But the replica still contains:

```text
Replica:
status = PENDING
```

A read from the replica may return stale data.

This is one of the major consistency challenges in distributed systems.

Replication is useful, but the application must understand the guarantees provided by the replication mode.

---

## 13. Distributed Systems and CAP Theorem

We will study the CAP theorem in detail in Part 9B.

For now, understand the three terms.

### 13.1 Consistency (C)

All clients observe data according to a single consistent view of completed updates.

In the CAP context, consistency refers specifically to a strong consistency guarantee associated with linearizability.

### 13.2 Availability (A)

Every request received by a non-failing node receives a non-error response.

This does not mean every response necessarily contains the latest data.

### 13.3 Partition Tolerance (P)

The system continues operating despite network communication failures that partition nodes.

### 13.4 Why Does CAP Matter?

Consider a distributed database with two groups of nodes.

```text
Group A                  Group B

Node 1                   Node 3
Node 2                   Node 4

       Network Partition
```

The system cannot reliably coordinate across the partition.

It must make decisions about which operations it can safely accept.

This is the core problem explored by CAP.

Do not reduce CAP to the oversimplified statement that every database must always choose only two properties.

We will examine the exact theorem, assumptions, and practical consequences in Part 9B.

---

## 14. Failure Detection and Timeouts

A distributed system needs to determine whether another node is healthy.

But this is harder than it looks.

### 14.1 Why Is Failure Detection Difficult?

Suppose Service A sends a request to Service B.

Service B does not respond.

Is Service B down?

Not necessarily.

Possible reasons:

- Service B crashed.
- Network communication failed.
- Service B is overloaded.
- The request is delayed.
- The response is delayed.
- A firewall or routing issue exists.

A timeout tells us that a response did not arrive within the expected time.

It does not prove the remote service has crashed.

### 14.2 Timeout

A timeout limits how long the application waits for a response.

Example:

```javascript
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 3000);

try {
  const response = await fetch("http://inventory-service/api/products/101", {
    signal: controller.signal,
  });

  const product = await response.json();

  console.log(product);
} catch (error) {
  console.error("Request failed or timed out", error);
} finally {
  clearTimeout(timeout);
}
```

This example uses a three-second request timeout.

In production, timeout values should be based on service latency expectations and the overall request deadline.

### 14.3 Heartbeats

A heartbeat is a periodic signal used to indicate that a node is alive or communicating.

Example:

```text
Node 1 ---- heartbeat ----> Node 2
Node 1 ---- heartbeat ----> Node 2
Node 1 ---- heartbeat ----> Node 2
```

If heartbeats stop arriving, the receiving node may suspect a failure.

However, missing heartbeats do not prove that the remote machine has crashed. Network delays can also cause missed heartbeats.

### 14.4 Health Checks

A health check verifies whether a service is operational.

Example Node.js endpoint:

```javascript
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});
```

A production health-check strategy may distinguish:

- Liveness: Is the process running?
- Readiness: Can the instance accept traffic?
- Dependency health: Are required external services available?

A process can be alive but unable to serve requests correctly.

---

## 15. Retries and Backoff

Network communication can fail temporarily.

Applications often retry failed operations.

However, careless retries can make an overloaded system even worse.

### 15.1 Basic Retry

```javascript
async function fetchData() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await callExternalService();
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
    }
  }
}
```

This example retries up to three times.

But it has a problem: retries happen immediately.

### 15.2 Exponential Backoff

Exponential backoff increases the waiting time between attempts.

Example:

| Attempt | Waiting Time |
| ------- | -----------: |
| 1       |       100 ms |
| 2       |       200 ms |
| 3       |       400 ms |
| 4       |       800 ms |

A conceptual formula:

\[
Delay = BaseDelay \times 2^{Attempt}
\]

In practice, systems often add random jitter to prevent many clients from retrying simultaneously.

### 15.3 Why Is Jitter Useful?

Suppose 10,000 clients experience the same failure.

If every client retries after exactly one second, they may overload the recovering service again.

This is called a retry storm.

Randomized retry delays spread requests over time.

### 15.4 Idempotency

Retries are dangerous when an operation creates a business side effect.

Suppose a payment request times out.

The application does not know whether the payment succeeded.

If it blindly retries, the customer may be charged twice.

Use idempotency keys or another deduplication strategy.

Example:

```javascript
await paymentService.charge({
  orderId: 1001,
  amount: 2500,
  idempotencyKey: "ORDER-1001-PAYMENT",
});
```

The payment service must persist and enforce the key.

Sending a unique identifier alone does not make an operation idempotent.

### 15.5 When Should You Retry?

| Failure                 | Possible Action                                                     |
| ----------------------- | ------------------------------------------------------------------- |
| Temporary network error | Retry with backoff                                                  |
| Request timeout         | Check operation status before retrying if side effects are possible |
| Validation error        | Do not retry unchanged input                                        |
| Authentication failure  | Fix credentials or authorization                                    |
| Service overloaded      | Retry carefully with backoff                                        |
| Duplicate request       | Return the previously recorded result when supported                |

---

## 16. Circuit Breaker Pattern

### 16.1 What Problem Does It Solve?

Suppose Service A calls Service B.

Service B becomes unavailable.

Service A continues sending requests.

Each request waits for a timeout.

Soon Service A may exhaust its own resources waiting for Service B.

This is cascading failure.

### 16.2 Circuit Breaker

A circuit breaker prevents repeated calls to a failing dependency for a period of time.

It has three common states.

**1. Closed**

Requests are allowed through.

```text
Service A ---> Service B
```

**2. Open**

Requests are blocked or rejected quickly.

```text
Service A -X-> Service B
```

**3. Half-Open**

A limited number of test requests are allowed to determine whether the dependency has recovered.

```text
Service A ---> Service B
           Test Request
```

If the test succeeds, the circuit can close.

If it fails, the circuit opens again.

### 16.3 State Flow

```text
          CLOSED
             |
       Failures exceed
       configured limit
             |
             v
           OPEN
             |
       Wait for recovery
             |
             v
         HALF-OPEN
          /      \
      Success   Failure
        |          |
        v          v
      CLOSED     OPEN
```

### 16.4 Benefits

- Prevents excessive calls to failing services.
- Reduces resource exhaustion.
- Helps stop cascading failures.
- Allows recovery time for unhealthy dependencies.

A circuit breaker should be configured carefully. It is not a replacement for timeouts, retries, or health checks.

---

## 17. Load Balancing in Distributed Systems

### 17.1 What Is Load Balancing?

Load balancing distributes incoming requests across multiple servers.

Example:

```text
                 Clients
                    |
                    v
               Load Balancer
                    |
          -----------------------
          |          |          |
          v          v          v
       Server 1   Server 2   Server 3
```

Instead of sending all traffic to one server, the load balancer distributes it.

### 17.2 Why Do We Need It?

- Distribute traffic.
- Avoid overloading one server.
- Improve resource utilization.
- Support horizontal scaling.
- Route traffic away from unhealthy instances.

### 17.3 Common Load-Balancing Algorithms

**1. Round Robin**

Requests are distributed sequentially.

```text
Request 1 -> Server 1
Request 2 -> Server 2
Request 3 -> Server 3
Request 4 -> Server 1
```

**2. Weighted Round Robin**

Servers receive requests according to assigned weights.

A server with more capacity can receive more traffic.

**3. Least Connections**

New requests are directed toward the server with fewer active connections.

**4. IP Hash**

A hash of the client IP is used to select a server.

This can provide a form of session affinity, but it does not guarantee perfect load distribution.

### 17.4 Health Checks and Load Balancing

A load balancer can monitor backend health.

If Server 2 becomes unhealthy, it can stop routing new requests to it.

```text
              Load Balancer
                    |
          -----------------------
          |          |          |
          v          X          v
       Server 1   Server 2   Server 3
       Healthy    Failed     Healthy
```

Load balancing improves distribution, but it does not automatically solve database consistency or application-state problems.

---

## 18. Distributed Systems and Shared State

### 18.1 What Is Shared State?

Shared state is information that multiple application instances need to access.

Consider two Node.js servers.

```text
Server 1
Server 2
```

Suppose Server 1 stores user session data in its local memory.

```javascript
const sessions = new Map();
```

A user logs in through Server 1.

The session is stored in Server 1's memory.

The next request reaches Server 2.

Server 2 does not have that session.

This creates a problem.

### 18.2 Shared State Using Redis

Instead of storing sessions in each application's memory, use a shared external store.

```text
          Server 1
              |
              |
              v
            Redis
              ^
              |
              |
          Server 2
```

Both servers access the same session store.

This makes session state available across application instances.

### 18.3 Stateless Application Servers

A stateless application server does not rely on local in-memory state to preserve information between requests.

Instead, state is stored in systems such as:

- Redis.
- PostgreSQL.
- Other shared storage.
- Signed client-side tokens, where appropriate.

Stateless application servers are easier to scale horizontally because requests can be handled by different instances.

Important: Stateless does not mean the overall application has no state. It means the application instance does not depend on its own local state for the relevant workflow.

---

## 19. Distributed Systems Challenges: Summary

Distributed systems introduce challenges that are less prominent in a single-process or single-server architecture.

| Challenge          | Explanation                                          |
| ------------------ | ---------------------------------------------------- |
| Network Latency    | Communication takes time                             |
| Partial Failure    | Some components fail while others continue           |
| Network Partition  | Nodes cannot communicate across network boundaries   |
| Consistency        | Nodes may temporarily observe different data         |
| Availability       | System must remain accessible during failures        |
| Fault Tolerance    | System must handle component failures                |
| Coordination       | Multiple nodes must agree on operations              |
| Duplicate Messages | Requests or events may be delivered more than once   |
| Ordering           | Messages may arrive in a different order             |
| Failure Detection  | A timeout cannot always prove a node has crashed     |
| Shared State       | Multiple instances need access to common information |
| Cascading Failure  | One service failure causes others to fail            |

These challenges explain why distributed systems require careful architecture rather than simply adding more servers.

---

## 20. Common Misconceptions

### Misconception 1: A distributed system is just multiple servers.

Incomplete.

Multiple servers become a distributed system when they communicate and coordinate to provide a service.

### Misconception 2: Multiple servers guarantee high availability.

Incorrect.

Shared dependencies, network failures, configuration errors, or common infrastructure can still bring the system down.

### Misconception 3: A timeout means the remote service failed.

Incorrect.

The service may have processed the request but failed to return a response in time.

### Misconception 4: Retrying every failed request is safe.

Incorrect.

Retries can duplicate side effects and worsen overload. Use idempotency, bounded retries, and backoff.

### Misconception 5: Network partitions mean servers have crashed.

Incorrect.

The nodes may still be running but unable to communicate.

### Misconception 6: Replication guarantees strong consistency.

Incorrect.

Asynchronous replication can produce temporary stale reads.

### Misconception 7: Adding more nodes always improves performance.

Incorrect.

Coordination, network traffic, replication, and routing overhead can reduce performance.

### Misconception 8: A circuit breaker fixes a failing service.

Incorrect.

It limits repeated calls and protects dependent systems. The underlying service still needs recovery.

### Misconception 9: Stateless applications have no state.

Incorrect.

Their state is stored outside individual application instances.

### Misconception 10: Distributed systems are always better than single-server systems.

Incorrect.

Distributed systems add operational and architectural complexity. A single well-designed server may be sufficient for many applications.

---

## 21. Interview Questions

### Q1. What is a distributed system?

A collection of independent computers that communicate over a network and coordinate to provide a common service.

### Q2. What is a node?

An individual computer or computing instance participating in a distributed system.

### Q3. What is a cluster?

A group of connected nodes working together to provide a service.

### Q4. Why do we need distributed systems?

For scalability, availability, fault tolerance, geographic distribution, and workload separation.

### Q5. What is horizontal scaling?

Adding more servers and distributing workload across them.

### Q6. What is partial failure?

When some components fail while other components continue operating.

### Q7. What is a network partition?

A condition in which communication between groups of nodes becomes unavailable or unreliable.

### Q8. What is fault tolerance?

The ability of a system to continue operating, possibly with reduced functionality, despite component failures.

### Q9. What is failover?

Switching operations from a failed component to another available component.

### Q10. What is availability?

The proportion of time a system remains operational and accessible.

### Q11. What is network latency?

The time required for data to travel between communicating endpoints.

### Q12. What is the difference between latency and throughput?

Latency measures the time taken by an operation. Throughput measures how many operations are completed per unit of time.

### Q13. Why are network calls more difficult than local function calls?

They introduce network latency, timeouts, partial failures, communication errors, and uncertainty about whether an operation completed.

### Q14. What is a heartbeat?

A periodic signal used to indicate that a node is alive or communicating.

### Q15. Why can't a timeout prove that a node has crashed?

Because the request or response may be delayed or lost even when the node is healthy.

### Q16. What is eventual consistency?

A model in which replicas may temporarily disagree but are expected to converge if updates stop and replication succeeds.

### Q17. What is a circuit breaker?

A pattern that temporarily stops requests to a failing dependency to prevent repeated failures and resource exhaustion.

### Q18. What is a load balancer?

A component that distributes incoming requests across multiple servers.

### Q19. What is shared state?

Information that multiple application instances need to access.

### Q20. Why is Redis useful in distributed application architectures?

It can provide shared storage for sessions, caches, counters, and other key-based data accessed by multiple application instances.

### Q21. What is cascading failure?

A situation in which the failure of one component causes dependent components to become overloaded or fail as well.

### Q22. Does adding more servers automatically improve availability?

No. The system must also handle failures, routing, redundancy, shared dependencies, and recovery.

---

## 22. Practical Learning Exercise

### Exercise A: Identify the Distributed Components

Consider this architecture:

```text
              Load Balancer
                    |
          -----------------------
          |          |          |
          v          v          v
       Node.js    Node.js    Node.js
       Server 1   Server 2   Server 3
          |          |          |
          ------------          |
                |               |
                v               v
               Redis       PostgreSQL
```

Answer:

1. How many application nodes are present?
2. Why is Redis separate from the application servers?
3. What happens if Server 2 crashes?
4. What happens if Redis becomes unavailable?
5. Is PostgreSQL necessarily a distributed database in this architecture?

### Exercise B: Partial Failure

An order service calls:

1. Inventory Service.
2. Payment Service.
3. Notification Service.

Suppose payment succeeds but notification fails.

Questions:

- Should the payment be reversed?
- Should the order remain confirmed?
- How should the notification be retried?
- How can duplicate notifications be prevented?

### Exercise C: Network Partition

A database has three nodes.

A network failure separates one node from the other two.

Questions:

1. Are all three nodes necessarily crashed?
2. Can the isolated node communicate with the other two?
3. Should both sides continue accepting writes?
4. What consistency problems could occur?
5. What information would a database need to make safe decisions?

These questions lead into the CAP theorem.

### Exercise D: Failure Handling

For each situation, identify a suitable technique.

| Situation                                     | Possible Technique            |
| --------------------------------------------- | ----------------------------- |
| API waits too long for a dependency           | Timeout                       |
| Temporary service failure                     | Bounded retry with backoff    |
| Payment request may have been processed twice | Idempotency                   |
| Dependency repeatedly fails                   | Circuit breaker               |
| Application instance crashes                  | Load balancing and failover   |
| Multiple servers need common session data     | Redis or another shared store |
| Detect whether a node is communicating        | Heartbeat                     |

### Exercise E: Design a Fault-Tolerant Backend

Design an architecture for a backend with:

- Three Node.js instances.
- A load balancer.
- PostgreSQL primary and replica.
- Redis for shared sessions.
- A background worker.
- A message queue.

Explain what happens when each component fails.

Do not just draw the architecture. Explain its recovery behavior.

---

## 23. Final Revision Sheet

| Concept               | Key Takeaway                                                     |
| --------------------- | ---------------------------------------------------------------- |
| Distributed System    | Independent computers cooperating over a network                 |
| Node                  | Individual participating computer or instance                    |
| Cluster               | Group of connected nodes                                         |
| Horizontal Scaling    | Add more servers                                                 |
| Network Communication | Nodes exchange messages                                          |
| Latency               | Time taken for communication or operation                        |
| Throughput            | Operations processed per unit of time                            |
| Partial Failure       | Some components fail while others continue                       |
| Network Partition     | Communication between groups of nodes is interrupted             |
| Fault Tolerance       | Ability to continue despite component failures                   |
| Availability          | Proportion of time the service is operational                    |
| Failover              | Switch from a failed component to another                        |
| Replication           | Maintain copies of data                                          |
| Strong Consistency    | Reads observe updates according to strong consistency guarantees |
| Eventual Consistency  | Replicas may temporarily disagree and later converge             |
| Heartbeat             | Periodic signal indicating node activity                         |
| Timeout               | Maximum time allowed for an operation                            |
| Retry                 | Repeat an operation after a failure                              |
| Exponential Backoff   | Increase delay between retry attempts                            |
| Idempotency           | Repeated execution has the same intended effect                  |
| Circuit Breaker       | Prevent repeated calls to an unhealthy dependency                |
| Load Balancer         | Distribute requests across servers                               |
| Shared State          | Data accessible by multiple application instances                |

### The Most Important Mental Model

```text
             DISTRIBUTED SYSTEM
                     |
          -----------------------
          |          |          |
          v          v          v
       Multiple   Network    Coordination
        Nodes   Communication
          |          |          |
          -----------------------
                     |
                     v
                 CHALLENGES
                     |
          -----------------------
          |          |          |
          v          v          v
       Partial    Network    Consistency
       Failures  Partitions
          |          |          |
          -----------------------
                     |
                     v
               SOLUTIONS
                     |
          -----------------------
          |          |          |
          v          v          v
       Replication Failover  Fault Tolerance
       Timeouts    Retries   Load Balancing
```

**The central lesson: A distributed system is not simply a collection of servers. It is a system in which independent components must communicate and coordinate despite latency, failures, and uncertainty.**
