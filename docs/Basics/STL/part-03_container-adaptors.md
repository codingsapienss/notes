# C++ STL Handbook — Part 3 Container Adaptors

**Topics Covered**

- Stack
- Internal Working of Stack
- LIFO Concept
- Stack Operations
- Queue
- Internal Working of Queue
- FIFO Concept
- Queue Operations
- Priority Queue
- Internal Working of Priority Queue
- Max Heap
- Min Heap
- Time Complexity
- Real-world Applications
- Comparison Tables
- Common Bugs
- Best Practices
- Interview Questions

---

# Introduction to Container Adaptors

## What Are Container Adaptors?

Container adaptors are special containers that modify the behavior of existing containers.

They do not store data independently from scratch.

They provide restricted interfaces.

Examples:

- Stack
- Queue
- Priority Queue

---

## Why Container Adaptors Exist

Normal containers like vector provide:

- random access
- insertion anywhere
- deletion anywhere

But sometimes we want controlled behavior.

Examples:

### Browser History

```text
Open A
Open B
Open C

Back button:

C
B
A
```

Requires:

```text
LIFO
```

---

### Ticket Counter

```text
Person A
Person B
Person C
```

First person entering:

```text
Person A
```

Leaves first.

Requires:

```text
FIFO
```

---

# Stack

## Intuition

Stack follows:

```text
LIFO

Last In First Out
```

Real-world examples:

- Stack of plates
- Browser history
- Undo operation
- Function calls
- Backtracking algorithms

---

# Visual Understanding

Push:

```text
Bottom

10
20
30

Top
```

Pop:

```text
Bottom

10
20

Top
```

Removed:

```text
30
```

---

## Internal Working

By default:

```cpp
stack<int>
```

internally uses:

```cpp
deque
```

It can also use:

```cpp
vector
list
```

---

# Syntax

```cpp
stack<int> st;
```

Header:

```cpp
#include<stack>
```

---

# push()

Adds element.

```cpp
st.push(10);

st.push(20);

st.push(30);
```

Memory:

```text
Bottom

10
20
30

Top
```

---

# emplace()

Constructs directly.

```cpp
st.emplace(40);
```

---

# top()

Returns top element.

```cpp
cout<<st.top();
```

Output:

```text
40
```

Element remains in stack.

---

# pop()

Removes top element.

```cpp
st.pop();
```

---

## Important Detail

Wrong:

```cpp
cout<<st.pop();
```

Problem:

```cpp
pop()
```

returns nothing.

Correct:

```cpp
cout<<st.top();

st.pop();
```

---

# empty()

Checks whether stack is empty.

```cpp
if(st.empty())
{
    cout<<"Empty";
}
```

---

# swap()

```cpp
st1.swap(st2);
```

---

# size()

```cpp
cout<<st.size();
```

---

# Complete Example

```cpp
#include<iostream>
#include<stack>

using namespace std;

int main()
{
    stack<int> st;

    st.push(10);

    st.push(20);

    st.push(30);

    cout<<st.top()<<endl;

    st.pop();

    cout<<st.top();
}
```

Output:

```text
30

20
```

---

## Code Explanation

```cpp
st.push(10)
```

Adds element.

```cpp
st.top()
```

Returns top.

```cpp
st.pop()
```

Removes top.

---

# Can We Access First or Middle Elements?

No.

Wrong:

```cpp
st[2]
```

Wrong:

```cpp
st.begin()
```

Stack intentionally hides these operations.

Only allowed:

- top
- push
- pop

---

# Time Complexity

| Operation | Complexity |
| --------- | ---------- |
| push      | O(1)       |
| pop       | O(1)       |
| top       | O(1)       |
| empty     | O(1)       |
| size      | O(1)       |

---

# Queue

## Intuition

Queue follows:

```text
FIFO

First In First Out
```

Real-world examples:

- Ticket queue
- Printer queue
- CPU scheduling
- Task scheduling
- Message systems

---

# Visual Understanding

Insertion:

```text
Front

10 20 30

Back
```

Remove:

```text
Front

20 30

Back
```

Removed:

```text
10
```

---

# Internal Working

Default implementation:

```cpp
deque
```

---

# Syntax

```cpp
queue<int> q;
```

Header:

```cpp
#include<queue>
```

---

# push()

```cpp
q.push(10);

q.push(20);

q.push(30);
```

---

# emplace()

```cpp
q.emplace(40);
```

---

# front()

Returns first element.

```cpp
cout<<q.front();
```

Output:

```text
10
```

---

# back()

Returns last inserted element.

```cpp
cout<<q.back();
```

Output:

```text
40
```

---

# pop()

Deletes front element.

```cpp
q.pop();
```

---

# Complete Example

```cpp
#include<iostream>
#include<queue>

using namespace std;

int main()
{
    queue<int> q;

    q.push(10);

    q.push(20);

    q.push(30);

    cout<<q.front()<<endl;

    q.pop();

    cout<<q.front();
}
```

Output:

```text
10

20
```

---

# Time Complexity

| Operation | Complexity |
| --------- | ---------- |
| push      | O(1)       |
| pop       | O(1)       |
| front     | O(1)       |
| back      | O(1)       |
| size      | O(1)       |

---

# Stack vs Queue

| Feature | Stack    | Queue          |
| ------- | -------- | -------------- |
| Rule    | LIFO     | FIFO           |
| Insert  | Top      | Back           |
| Remove  | Top      | Front          |
| Access  | Top only | Front and Back |

---

# Priority Queue

## Intuition

Normal queue:

```text
First come → First serve
```

Priority queue:

```text
Highest priority first
```

Example:

Hospital emergency system:

```text
Patient A → Medium

Patient B → Critical

Patient C → Low
```

Execution:

```text
Patient B

Patient A

Patient C
```

---

# Internal Working

Internally uses:

```text
Heap Data Structure
```

Usually:

```text
Binary Heap
```

Implemented over:

```cpp
vector
```

---

# Max Heap

Default priority queue:

Largest element remains at top.

---

# Visual Understanding

Insert:

```text
5
2
8
1
7
```

Heap:

```text
        8
      /   \
     7     5
    / \
   1   2
```

Top:

```text
8
```

---

# Syntax

```cpp
priority_queue<int> pq;
```

Header:

```cpp
#include<queue>
```

---

# Operations

## push()

```cpp
pq.push(5);

pq.push(2);

pq.push(8);

pq.push(1);
```

---

## emplace()

```cpp
pq.emplace(10);
```

---

## top()

```cpp
cout<<pq.top();
```

Output:

```text
10
```

---

## pop()

```cpp
pq.pop();
```

Removes highest priority.

---

# Example

```cpp
#include<iostream>
#include<queue>

using namespace std;

int main()
{
    priority_queue<int> pq;

    pq.push(5);

    pq.push(2);

    pq.push(8);

    pq.push(1);

    cout<<pq.top()<<endl;

    pq.pop();

    cout<<pq.top();
}
```

Output:

```text
8

5
```

---

# Min Heap

Normally:

```text
Largest at top
```

For smallest at top:

Syntax:

```cpp
priority_queue<
int,
vector<int>,
greater<int>
> pq;
```

---

# Example

```cpp
priority_queue<
int,
vector<int>,
greater<int>
> pq;

pq.push(5);

pq.push(4);

pq.push(2);

cout<<pq.top();
```

Output:

```text
2
```

---

# Internal Working of Heap Insertion

Insert:

```text
5
2
8
```

Step 1:

```text
5
```

Step 2:

```text
    5
   /
  2
```

Step 3:

```text
    5
   /
  2
   \
    8
```

Heapify:

```text
      8
    /   \
   2     5
```

---

# Complexity Analysis

| Operation | Complexity |
| --------- | ---------- |
| push      | O(logN)    |
| pop       | O(logN)    |
| top       | O(1)       |
| empty     | O(1)       |
| size      | O(1)       |

---

# Why push() Takes O(logN)

Heap height:

```text
logN
```

Insertion may travel from leaf to root.

---

# Real-world Applications

## Stack

Used in:

- Browser history
- Undo operation
- Expression evaluation
- DFS
- Backtracking
- Function call stack

---

## Queue

Used in:

- CPU scheduling
- Printer scheduling
- BFS
- Request processing
- Task management

---

## Priority Queue

Used in:

- Dijkstra Algorithm
- CPU scheduling
- Job scheduling
- Network routing
- Event simulation
- AI pathfinding

---

# Common Bugs

## Bug 1

Wrong:

```cpp
cout<<st.pop();
```

Reason:

```cpp
pop()
```

returns nothing.

---

## Bug 2

Wrong:

```cpp
cout<<q.front();

q.pop();

cout<<q.front();
```

Problem:

Queue may become empty.

---

## Fix

```cpp
if(!q.empty())
{
    cout<<q.front();
}
```

---

## Bug 3

Wrong:

```cpp
priority_queue<int,
vector<int>,
greater> pq;
```

Missing datatype.

Correct:

```cpp
priority_queue<
int,
vector<int>,
greater<int>
> pq;
```

---

# Best Practices

- Use stack for LIFO problems
- Use queue for FIFO problems
- Use priority queue when order depends on priority
- Always check `empty()`
- Use `emplace()` for objects

---

# Interview Questions

## Q1

Why stack does not allow indexing?

Answer:

Stack intentionally restricts access to preserve LIFO behavior.

---

## Q2

What is internally used by priority queue?

Answer:

Binary heap.

---

## Q3

Difference between queue and priority queue?

Answer:

Queue:

```text
FIFO
```

Priority Queue:

```text
Priority-based
```

---

## Q4

Why push in priority queue is O(logN)?

Answer:

Heapify operation may move element through tree height.

---

# Cheat Sheet

```cpp
stack<int> st;

st.push(10);

st.top();

st.pop();

st.empty();


queue<int> q;

q.push(10);

q.front();

q.back();

q.pop();


priority_queue<int> pq;

pq.push(10);

pq.top();

pq.pop();


priority_queue<
int,
vector<int>,
greater<int>
> minHeap;
```

---

# Key Takeaways

- Stack follows LIFO
- Queue follows FIFO
- Priority Queue uses Heap
- Max Heap is default
- Min Heap uses `greater<int>`
- Stack does not allow indexing
- Priority Queue insertion takes O(logN)

---

# End of Part 3
