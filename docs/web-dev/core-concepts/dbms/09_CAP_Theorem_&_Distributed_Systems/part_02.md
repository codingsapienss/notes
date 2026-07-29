---
sidebar_label: CAP Theorem
sidebar_position: 1
---

# CAP Theorem

## 1. Introduction to CAP Theorem

CAP theorem is one of the most important concepts in distributed database systems.

It explains a fundamental trade-off that distributed systems face when network communication between nodes fails.

Imagine an application running across two database nodes:

- Node A stores a copy of the data.
- Node B stores another copy of the data.
- Both nodes communicate over a network.
- Clients can send requests to either node.

Under normal conditions, the nodes can communicate and coordinate their data.

But what happens when the network connection between them breaks?

Should both nodes continue accepting requests, even if their data becomes inconsistent?

Or should the system reject some requests to prevent inconsistent data?

This is the problem CAP theorem describes.

### CAP stands for

| Letter | Property            | Meaning                                                                                                                      |
| ------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| C      | Consistency         | Every successful read returns the latest committed write, according to a strong consistency guarantee called linearizability |
| A      | Availability        | Every request received by a non-failing node receives a non-error response                                                   |
| P      | Partition Tolerance | The system continues operating despite network communication failures between nodes                                          |

**Central idea:** When a network partition occurs, a distributed system cannot guarantee both strong consistency and availability for every request.

---

## 2. Understanding the Three Properties

Before understanding the trade-off, we need to understand each property precisely.

### 2.1 Consistency (C)

In CAP theorem, consistency means **linearizability**, also called atomic consistency.

It means that once a write operation has successfully completed, every subsequent read must return that latest value.

Consider an account balance:

```text
Initial balance = ₹10,000
```

A client updates the balance:

```text
UPDATE balance = 15,000
```

The database confirms that the update succeeded.

Now another client reads the balance.

A strongly consistent system must return:

```text
₹15,000
```

It must not return the old value:

```text
₹10,000
```

This guarantee applies across the distributed system, not just to one individual node.

#### Example: Two replicated nodes

Initially:

```text
Node A: balance = ₹10,000
Node B: balance = ₹10,000
```

A write updates the balance:

```text
Client → Node A

Node A: balance = ₹15,000
Node B: balance = ₹15,000
```

After the write is acknowledged, a read from either node must return ₹15,000 under linearizability.

**Important:** CAP consistency is not the same as ACID consistency.

| CAP Consistency                                                   | ACID Consistency                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| A distributed systems guarantee                                   | A transaction correctness property                            |
| Concerned with visibility and ordering of operations across nodes | Concerned with preserving database constraints and invariants |
| Commonly defined as linearizability                               | Ensures transactions preserve valid database states           |

For example, an ACID transaction may preserve a foreign-key constraint while a replica still returns stale data. These are different concerns.

### 2.2 Availability (A)

Availability in CAP theorem means:

Every request received by a non-failing node must receive a non-error response.

The response does not necessarily have to contain the latest data.

Consider:

```text
Node A: balance = ₹15,000
Node B: balance = ₹10,000
```

A client sends a read request to Node B.

An available system may return:

```text
₹10,000
```

The value is stale, but the node responded successfully.

A system that rejects the request because it cannot verify whether the data is current is sacrificing availability for that request.

**Important:** Availability in CAP does not simply mean that your website is online or that your database server is running.

It is a formal guarantee about responses to requests during a network partition.

### 2.3 Partition Tolerance (P)

Partition tolerance means that the distributed system can continue operating despite a communication failure between groups of nodes.

A network partition occurs when nodes cannot communicate with one another.

For example:

```text
       Distributed Database

       Node A          Node B
          |               |
          |               |
          X---------------X
           Network Failure
```

Both nodes might still be running.

They might have:

- CPU and memory available.
- Disk access working.
- Their database processes running.
- Clients connected to them.

But they cannot communicate with each other.

This is fundamentally different from a node crash.

| Node Failure                          | Network Partition                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| A node stops operating                | Nodes may still be operating                                                   |
| The failed node cannot serve requests | Both sides may still receive requests                                          |
| Other nodes may detect the failure    | Nodes may be unable to determine whether the other side is down or unreachable |
| Example: Database process crashes     | Example: Network link between data centers fails                               |

#### Why is partition tolerance important?

Distributed systems depend on networks.

Networks can experience:

- Packet loss.
- Network outages.
- Routing failures.
- Firewall misconfiguration.
- High latency.
- Data center connectivity failures.
- Temporary communication failures.

No distributed system can assume that network communication will always work.

Therefore, partition tolerance is a practical requirement for distributed systems.

---

## 3. The CAP Theorem Explained

The CAP theorem states:

**When a network partition occurs, a distributed system must choose between preserving linearizable consistency and guaranteeing availability for requests on the partitioned nodes.**

Let's understand this through an example.

### 3.1 Normal operation

Suppose we have two database nodes:

```text
             Client
                |
                |
         Distributed DB
                |
       -------------------
       |                 |
    Node A             Node B
       |                 |
       -------------------
        Network Connected
```

Initial data:

```text
Node A: balance = ₹10,000
Node B: balance = ₹10,000
```

A client updates the balance to ₹15,000.

The nodes communicate successfully and replicate the update.

```text
Node A: balance = ₹15,000
Node B: balance = ₹15,000
```

Everything works normally.

Both consistency and availability can be maintained.

### 3.2 Network partition occurs

Now imagine the network connection between the nodes breaks.

```text
              Network Partition

        CLIENT A             CLIENT B
            |                    |
            v                    v
        +--------+            +--------+
        | Node A |     X      | Node B |
        +--------+            +--------+
            |                    |
            |                    |
       balance =             balance =
       ₹10,000                ₹10,000
```

Both nodes are still running, but they cannot communicate.

Now clients send write requests to both sides.

```text
Client A → Node A: Set balance = ₹15,000

Client B → Node B: Set balance = ₹20,000
```

What should the system do?

It has two broad choices.

1. Preserve strong consistency by refusing or delaying operations that cannot safely be coordinated.
2. Preserve availability by accepting operations even though the nodes cannot coordinate their state.

This is the CAP trade-off.

---

## 4. Understanding CP Systems

CP stands for:

- C = Consistency
- P = Partition Tolerance

A CP system prioritizes consistency when a network partition occurs.

It may reject, block, or delay requests that cannot be safely processed.

### 4.1 How CP works

Suppose we have two nodes:

```text
Node A: balance = ₹10,000
Node B: balance = ₹10,000
```

A network partition occurs.

```text
       Client A                 Client B
           |                        |
           v                        v
       +--------+                +--------+
       | Node A |       X        | Node B |
       +--------+                +--------+
```

A client sends a write request to Node A:

```text
Set balance = ₹15,000
```

Node A cannot communicate with Node B.

It cannot safely establish that the write will be globally ordered and replicated under the system's consistency guarantee.

The system may:

- Reject the write.
- Wait for communication to recover.
- Redirect the request to a node that can safely coordinate it.

For example:

```text
Client → Node A
          |
          v
    Cannot coordinate
          |
          v
    Request rejected
```

This sacrifices availability for that request to preserve strong consistency.

### 4.2 Why does CP sacrifice availability?

Consider a banking application.

Two users are trying to update the same account during a network partition.

If both sides independently accept conflicting updates, the system may produce an incorrect account balance.

For operations where correctness is more important than accepting every request, rejecting some requests is a reasonable choice.

Examples include:

- Financial transactions.
- Inventory reservation where overselling must be prevented.
- Distributed account balances.
- Systems requiring strict ordering of updates.

### 4.3 CP example: Majority-based coordination

Consider a cluster of three nodes:

```text
       Node A
          |
       Node B
          |
       Node C
```

A consensus-based system may require a majority of nodes to agree before committing an operation.

For three nodes:

```text
Majority = 2 nodes
```

If Node A becomes isolated:

```text
       Node A       X       Node B ---- Node C
       Isolated             Connected
```

Nodes B and C still have a majority.

They can continue accepting operations.

Node A cannot safely commit operations independently under the same consistency guarantee.

When communication recovers, Node A can synchronize with the cluster.

**Important:** A CP system does not necessarily shut down completely during a partition. The side that can safely coordinate may continue operating while another side rejects or delays requests.

---

## 5. Understanding AP Systems

AP stands for:

- A = Availability
- P = Partition Tolerance

An AP system prioritizes responding to requests during a network partition.

It may return stale data or accept conflicting updates that must be reconciled later.

### 5.1 How AP works

Initially:

```text
Node A: balance = ₹10,000
Node B: balance = ₹10,000
```

A network partition occurs:

```text
       Client A                 Client B
           |                        |
           v                        v
       +--------+                +--------+
       | Node A |       X        | Node B |
       +--------+                +--------+
```

Both nodes remain available to their clients.

Now:

```text
Client A → Node A: Set balance = ₹15,000

Client B → Node B: Set balance = ₹20,000
```

Both operations are accepted.

The nodes cannot immediately synchronize because the network is unavailable.

Their data becomes different:

```text
Node A: balance = ₹15,000
Node B: balance = ₹20,000
```

When communication is restored, the system must reconcile the conflicting updates.

### 5.2 What happens after the partition is resolved?

The nodes reconnect:

```text
        Node A ---------------- Node B
        ₹15,000                  ₹20,000
```

The system needs a conflict-resolution strategy.

Possible approaches include:

| Strategy                      | Explanation                                                          |
| ----------------------------- | -------------------------------------------------------------------- |
| Last-write-wins               | Select the update considered to have the latest timestamp or version |
| Version-based resolution      | Compare version metadata to identify conflicting changes             |
| Application-level merge       | Apply business rules to combine changes                              |
| Conflict-free data structures | Use data structures designed to merge concurrent updates             |
| Manual resolution             | Send unresolved conflicts for human or business-level review         |

The exact strategy depends on the database and application.

**Warning:** Last-write-wins can discard a valid update. Timestamps can also be unreliable if clocks are not synchronized.

### 5.3 Where AP is useful

AP-style behavior can be useful when accepting requests is more important than immediately returning the latest globally consistent value.

Examples:

- Social media feeds.
- Likes and reactions.
- View counters.
- Shopping cart synchronization.
- Distributed activity logs.
- Some collaborative applications.

For example, a social media platform may temporarily show different like counts in different regions.

That can be acceptable if the counts converge later.

However, an AP design is not automatically appropriate for every operation in those applications. A payment operation may still need stronger coordination.

---

## 6. CP vs AP — Side-by-Side Comparison

| Feature                           | CP                                          | AP                                             |
| --------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Primary priority during partition | Strong consistency                          | Availability                                   |
| Requests during partition         | Some may be rejected or delayed             | Nodes continue responding                      |
| Stale reads                       | Avoided under the consistency guarantee     | May be allowed                                 |
| Conflicting writes                | Prevented or coordinated                    | May be accepted and reconciled                 |
| Recovery                          | Restore communication and synchronize state | Reconcile divergent state                      |
| Typical use                       | Strictly coordinated operations             | Operations tolerant of temporary inconsistency |

### Simple mental model

**CP:** Better to reject a request than return or commit data that violates the consistency guarantee.

**AP:** Better to respond to the request, even if the result may temporarily be stale or conflicting.

Neither is universally better. The correct choice depends on business requirements.

---

## 7. Why CA Is Not a Practical Choice During Network Partitions

CA stands for:

- C = Consistency
- A = Availability

A CA system provides both consistency and availability, but does not tolerate network partitions.

Consider a database running on a single machine:

```text
         Application
              |
              v
        +-------------+
        |  Database   |
        +-------------+
```

There is no replication link between independent database nodes to partition.

Under normal operating assumptions, the database can provide consistent and available responses.

But if you distribute the database across multiple nodes, network partitions become possible.

During a partition, you cannot guarantee both strong consistency and availability for every request.

Therefore:

- CA can describe a system under an assumption that partitions do not occur.
- CA is not a third option that a genuinely distributed system can guarantee during arbitrary network partitions.
- A single-node database can avoid inter-node partition problems, but it does not provide distributed fault tolerance.

**Important:** Do not memorize CAP as a rule that every database permanently chooses exactly two properties. The actual trade-off becomes relevant when a partition occurs.

---

## 8. Why Accepting Writes on Both Sides Creates a Problem

This is the most important practical example for understanding CAP.

Suppose an inventory system has:

```text
Product: Laptop
Available stock: 1
```

The database has two replicas:

```text
Node A: stock = 1
Node B: stock = 1
```

A network partition separates them.

Two customers attempt to purchase the last laptop.

```text
Customer A → Node A
Customer B → Node B
```

If both nodes accept the purchase independently:

```text
Node A: stock = 0
Node B: stock = 0
```

Both customers receive successful purchase confirmations.

But the actual stock was only one.

The system has oversold the product.

This illustrates why availability alone is not enough for operations that require strong coordination.

### What would a CP system do?

It could allow only the side that has the authority to coordinate the inventory update to accept the purchase.

The other side may reject or delay its request.

Result:

```text
Customer A: Purchase successful
Customer B: Request rejected or delayed
```

One customer experiences an error, but the system protects the inventory invariant.

### What would an AP-style system do?

It might accept both requests during the partition.

After reconnection, the application needs a conflict-resolution or compensation process.

But compensation does not make the original overselling disappear automatically. The business may need to cancel an order, refund a payment, or source additional stock.

This is why business rules matter when choosing consistency behavior.

---

## 9. CAP and Database Architecture

CAP is about distributed systems behavior, not simply about whether a database is SQL or NoSQL.

A common misconception is:

```text
SQL = CP
NoSQL = AP
```

This is incorrect.

The architecture, replication protocol, consistency settings, and request behavior determine the trade-offs.

### 9.1 MongoDB

MongoDB replica sets use a primary-based architecture.

- Writes normally go to the primary.
- The primary replicates changes to secondary nodes.
- Write concern controls the acknowledgement requirement.
- Read preference controls which replica can serve reads.
- Read concern controls read guarantees.

For example:

```javascript
db.orders.insertOne(
  {
    userId: 101,
    total: 2500,
  },
  {
    writeConcern: {
      w: "majority",
    },
  },
);
```

A majority write concern requests acknowledgement from a majority of voting data-bearing members, subject to the deployment configuration.

If a primary loses connectivity to a majority, it cannot continue acting as a writable primary indefinitely. A new primary may be elected if a majority can elect one.

A secondary may still be able to serve reads depending on read preference and read concern, but those reads may not provide the same freshness guarantee as primary reads.

**Important:** Do not classify every MongoDB configuration as simply CP or AP. The behavior depends on topology, read/write concerns, and the operation being performed.

### 9.2 Apache Cassandra

Cassandra is a distributed wide-column database designed for availability and horizontal scalability.

It supports tunable consistency levels.

For example:

```sql
CONSISTENCY ONE;
```

A read or write can be acknowledged by one replica, depending on the operation.

A stronger consistency level can require more replicas to participate.

For example:

```sql
CONSISTENCY QUORUM;
```

A quorum requires a majority of the relevant replicas for the operation.

Cassandra allows applications to choose consistency levels according to their requirements.

Therefore, its behavior cannot be summarized accurately as always AP.

### 9.3 Amazon Dynamo-style systems

Dynamo-style distributed databases are commonly used to explain AP-oriented designs.

Their design emphasizes:

- High availability.
- Partition tolerance.
- Replication.
- Eventual convergence.
- Conflict resolution.

Different Dynamo-derived products have different consistency options and implementation details.

### 9.4 PostgreSQL

A traditional PostgreSQL primary with asynchronous standby replication is not automatically a fully distributed multi-writer database.

For example:

```text
Application
    |
    v
PostgreSQL Primary
    |
    v
Standby Replica
```

The standby receives replicated changes.

If replication is asynchronous, a recently committed transaction may not yet have reached the standby.

If the application reads from that standby, it may see stale data.

Synchronous replication can strengthen acknowledgement guarantees, but it introduces latency and availability trade-offs when synchronous standbys are unavailable.

A single-primary PostgreSQL deployment and a distributed multi-node database have different CAP-related behavior. Avoid assigning one simplistic CAP label to all PostgreSQL deployments.

### Comparison

| Database / Architecture                   | Important behavior                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| MongoDB replica set                       | Primary-based writes, configurable read/write concerns, majority-based elections                                                |
| Cassandra                                 | Tunable consistency levels and replicated data                                                                                  |
| Dynamo-style systems                      | Availability-oriented distributed design with conflict handling                                                                 |
| PostgreSQL primary + asynchronous standby | Replication lag can produce stale standby reads                                                                                 |
| Distributed SQL databases                 | Often use consensus and coordination to provide strong consistency across nodes, with availability trade-offs during partitions |

---

## 10. How Distributed Systems Detect and Handle Partitions

A database cannot always know immediately whether another node has crashed or is merely unreachable.

Consider:

```text
Node A  ---- X ----  Node B
```

Node A sends a message to Node B.

No response arrives.

Possible explanations:

1. Node B crashed.
2. The network is down.
3. The message was lost.
4. Node B is overloaded.
5. Node B received the message but its response was delayed.

The absence of a response does not prove that the other node has failed.

Distributed systems use several mechanisms to manage this uncertainty.

### 10.1 Timeouts

A timeout limits how long a node waits for another node.

Example:

```javascript
await fetch("http://database-node-b:8080/health", {
  signal: AbortSignal.timeout(3000),
});
```

If the request does not complete within three seconds, the application stops waiting.

A timeout is a failure signal, not proof that the remote node is dead.

### 10.2 Heartbeats

Nodes periodically send heartbeat messages.

```text
Node A → Heartbeat → Node B
Node B → Heartbeat → Node A
```

If heartbeats stop arriving, a node may be suspected of being unavailable.

However, heartbeat failure can also result from network delay or congestion.

### 10.3 Quorum

A quorum is a minimum number of nodes required to participate in an operation or decision.

For a cluster of three voting nodes:

```text
Quorum = 2
```

A majority-based system can continue making decisions if two nodes remain connected and healthy.

It generally cannot safely allow an isolated minority to make conflicting authoritative decisions.

### 10.4 Consensus

Consensus protocols help distributed nodes agree on a value, command order, or cluster state.

Examples include:

- Raft.
- Paxos.

Consensus is commonly used for leader election and replicated logs.

During a partition, a consensus group generally needs a quorum to make progress.

**Important:** Consensus is not the same thing as CAP theorem. Consensus is a mechanism that helps implement coordinated decisions and consistency guarantees.

---

## 11. CAP Theorem vs ACID Properties

These concepts are related to database correctness but solve different problems.

| CAP                                           | ACID                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| Distributed systems theorem                   | Transaction properties                                       |
| Explains trade-offs during network partitions | Explains guarantees of database transactions                 |
| C means linearizability                       | C means preserving valid database constraints and invariants |
| A concerns successful responses               | A concerns transaction durability                            |
| P concerns network communication failures     | P is not an ACID property                                    |

Example:

An application performs a money transfer:

```text
Account A: ₹10,000
Account B: ₹5,000
```

Transfer ₹2,000:

```text
Account A: ₹8,000
Account B: ₹7,000
```

ACID helps ensure that the transaction is atomic and preserves the database's business constraints.

If the database is distributed across nodes and a network partition occurs, CAP-related trade-offs determine whether the system can continue accepting requests while preserving strong consistency.

These are separate layers of the problem.

---

## 12. CAP Theorem vs PACELC

CAP explains the consistency-versus-availability trade-off during a network partition.

However, distributed databases also face trade-offs when there is no partition.

PACELC extends the discussion:

- **P:** If there is a Partition, choose between Availability and Consistency.
- **E:** Else, when the system is operating normally, choose between Latency and Consistency.

In simplified form:

```text
If Partition:
    Availability vs Consistency

Else:
    Latency vs Consistency
```

Why does this matter?

Even when all nodes can communicate, a system may need to wait for remote replicas to acknowledge a write.

Waiting can improve consistency but increase latency.

PACELC is useful for understanding that distributed database trade-offs do not disappear when the network is healthy.

This is only an introduction here; the main focus of this chapter is CAP.

---

## 13. Common CAP Theorem Misconceptions

| Misconception                                                            | Correct understanding                                                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| A database can always guarantee all three properties                     | During a network partition, strong consistency and availability cannot both be guaranteed for every request |
| CAP consistency means ACID consistency                                   | CAP consistency means linearizability                                                                       |
| Availability means the server process is running                         | It means requests to non-failing nodes receive non-error responses                                          |
| A network partition means a node crashed                                 | Nodes may be healthy but unable to communicate                                                              |
| CP means the entire database shuts down                                  | The side with a safe quorum or coordination authority may continue operating                                |
| AP means data is permanently inconsistent                                | Data may converge after communication is restored                                                           |
| CA is a practical third choice for distributed systems during partitions | CA assumes no partition; a distributed system must account for partitions                                   |
| SQL databases are CP and NoSQL databases are AP                          | CAP behavior depends on architecture and configuration                                                      |
| Eventual consistency means data is never consistent                      | It means replicas can converge if updates stop and synchronization succeeds                                 |
| Consensus and CAP are the same concept                                   | Consensus is a coordination mechanism; CAP describes a fundamental trade-off                                |

---

## 14. Interview Questions and Answers

### Q1. What is CAP theorem?

CAP theorem states that during a network partition, a distributed system cannot guarantee both linearizable consistency and availability for every request.

### Q2. What are the three CAP properties?

- Consistency: Reads return the latest committed value according to linearizability.
- Availability: Every request received by a non-failing node receives a non-error response.
- Partition tolerance: The system continues operating despite network communication failures between nodes.

### Q3. Why can't a distributed system guarantee C and A during a partition?

Because isolated nodes cannot coordinate their state.

If both sides accept conflicting writes, strong consistency may be violated.

If one side refuses or delays requests to preserve consistency, availability is sacrificed for those requests.

### Q4. What is a CP system?

A system that prioritizes strong consistency during a network partition, even if some requests must be rejected or delayed.

### Q5. What is an AP system?

A system that continues responding during a partition, potentially returning stale data or accepting conflicting updates that need reconciliation.

### Q6. Is MongoDB CP or AP?

There is no universally correct one-word answer for every MongoDB deployment.

MongoDB replica sets use a primary-based architecture and majority-based election behavior. Read/write concerns and read preferences affect the guarantees available to an application.

### Q7. Is Cassandra AP?

Cassandra is commonly associated with availability-oriented distributed architecture, but it supports tunable consistency levels. Its behavior depends on the chosen consistency level and replication configuration.

### Q8. Can a single-node database be CA?

A single-node database can provide consistency and availability under normal operating assumptions because there is no inter-node partition to tolerate. However, it cannot provide distributed fault tolerance.

### Q9. What happens when a CP system loses its majority?

It generally cannot safely commit operations that require the majority. It may reject or delay those operations until a majority is available.

### Q10. What happens when an AP system experiences a partition?

It can continue responding on isolated sides, but different nodes may return different data. The system needs a way to reconcile divergent state.

### Q11. Is eventual consistency the same as weak consistency?

Not exactly. Eventual consistency is a specific convergence guarantee: if updates stop and communication continues, replicas will eventually converge. Weak consistency is a broader term for guarantees weaker than strong consistency.

### Q12. Does CAP apply only to NoSQL databases?

No. CAP applies to distributed systems, including relational databases, NoSQL databases, distributed storage systems, and other replicated services.

### Q13. What is the difference between a network partition and a node failure?

A node failure means a node has stopped operating. A network partition means nodes cannot communicate, even though they may still be running.

### Q14. What is quorum?

A quorum is the minimum number of participating nodes required to make a decision or complete an operation under a particular protocol.

### Q15. Is consensus the same as consistency?

No. Consensus is a mechanism for coordinating agreement among distributed nodes. Consistency is a guarantee about how operations and data are observed.

---

## 15. Practical Exercises

### Exercise 1: Identify the CAP trade-off

A database has three nodes:

```text
Node A
Node B
Node C
```

A network partition separates Node A from Nodes B and C.

Answer:

1. Which side has the majority?
2. Can the majority side continue making decisions in a majority-based consensus system?
3. Should the isolated minority accept authoritative writes if the system promises strong consistency?
4. What happens to availability on the isolated side?

### Exercise 2: E-commerce inventory

An e-commerce platform has one laptop remaining.

Two database replicas become disconnected.

Both customers try to purchase the laptop.

Answer:

1. What happens if both replicas accept the purchase?
2. Which consistency guarantee is violated?
3. How could a CP-style design protect inventory?
4. What business-level compensation might be needed in an AP-style design?

### Exercise 3: Social media likes

A social media application stores like counts in multiple regions.

During a partition:

- Region A receives 10 likes.
- Region B receives 15 likes.

Answer:

1. What are the two regional counts?
2. Why might an AP-style design be acceptable?
3. How could the system reconcile the counts?
4. Why would simply overwriting one count with the other lose information?

### Exercise 4: Database configuration

Research or inspect the consistency options of a database you use.

For MongoDB, investigate:

- `writeConcern`
- `readConcern`
- `readPreference`
- Replica-set elections

Explain how these settings influence read freshness, write acknowledgement, and availability during failures.

---

## 16. Chapter Summary

CAP theorem describes the fundamental trade-off distributed systems face during network partitions.

| Concept              | Remember                                                              |
| -------------------- | --------------------------------------------------------------------- |
| Consistency          | Linearizable reads and writes                                         |
| Availability         | Every request to a non-failing node receives a non-error response     |
| Partition Tolerance  | Continue operating despite communication failures between nodes       |
| CP                   | Preserve strong consistency; some requests may be rejected or delayed |
| AP                   | Continue responding; stale or conflicting data may occur              |
| CA                   | Consistency and availability without tolerating network partitions    |
| Quorum               | Minimum participating nodes required for a decision                   |
| Consensus            | Protocol mechanism for coordinating agreement                         |
| Eventual consistency | Replicas converge after updates stop and synchronization succeeds     |

### The most important points to remember

1. CAP is relevant when a network partition occurs.
2. CAP consistency means linearizability, not ACID consistency.
3. A partition can isolate healthy nodes from each other.
4. CP systems may reject requests to protect consistency.
5. AP systems may accept requests and reconcile conflicts later.
6. No database is automatically CP or AP merely because it is SQL or NoSQL.
7. The correct design depends on the business operation and its consistency requirements.

### Final mental model

```text
                CAP THEOREM

              Network Partition
                      |
             -------------------
             |                 |
             v                 v
        Prioritize C      Prioritize A
             |                 |
             v                 v
            CP                AP
             |                 |
      Reject or delay     Continue responding
      unsafe requests    with possible stale data
```

**The engineering lesson:** Do not choose a database based only on its CAP label. Identify which operations require strong consistency, which can tolerate temporary inconsistency, and what your application should do when the network fails.
