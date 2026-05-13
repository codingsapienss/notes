---
sidebar_label: 'Revision'
---

# C++ STL: Final Revision

**Topics Covered**

- Complete STL Decision Guide
- When To Use Which Data Structure
- Master Comparison Tables
- Complexity Cheat Sheet
- Common Bugs and Debugging Tips
- Interview Questions
- Tricky Questions
- Best Practices
- Real-world Applications
- Revision Notes
- Final Cheat Sheet
- Key Takeaways

---

## STL Decision Tree

### Question 1

Do you need key-value pairs?

```text
                Key → Value ?
                    |
         Yes ---------------- No
          |                    |
        Map Types          Normal Containers
```

---

### Question 2

Need ordering?

```text
              Need sorting?
                  |
       Yes ---------------- No
        |                    |
      Map                 Unordered Map
```

---

### Question 3

Need duplicate keys?

```text
              Duplicate keys?
                    |
       Yes ---------------- No
        |                    |
   Multimap              Map
```

---

### Question 4

Need unique values only?

```text
              Unique values?
                    |
        Yes ---------------- No
          |                  |
        Set             Multiset
```

---

### Question 5

Need fastest lookup?

```text
           Fast lookup?
                 |
       Yes ---------------- No
        |                    |
Unordered Containers    Ordered Containers
```

---

### Question 6

Need insertion at front?

```text
          Push front?
                |
      Yes ---------------- No
        |                  |
     Deque              Vector
```

---

### Question 7

Need LIFO behavior?

```text
            LIFO?
              |
     Yes ------------- No
      |                 |
   Stack             Queue
```

---

### Question 8

Need highest priority element?

```text
      Highest priority first?
                 |
       Yes ------------- No
         |
Priority Queue
```

---

## Complete STL Comparison Table

| Feature       | Vector | List | Deque  | Stack  | Queue  |
| ------------- | ------ | ---- | ------ | ------ | ------ |
| Random Access | O(1)   | O(N) | O(1)   | No     | No     |
| Push Front    | O(N)   | O(1) | O(1)   | No     | No     |
| Push Back     | O(1)   | O(1) | O(1)   | O(1)   | O(1)   |
| Middle Insert | O(N)   | O(1) | O(N)   | No     | No     |
| Memory Usage  | Low    | High | Medium | Medium | Medium |

---

## Set Family Comparison

| Feature            | Set            | Multiset       | Unordered Set |
| ------------------ | -------------- | -------------- | ------------- |
| Duplicate Allowed  | No             | Yes            | No            |
| Sorted             | Yes            | Yes            | No            |
| Internal Structure | Red Black Tree | Red Black Tree | Hash Table    |
| Search             | O(logN)        | O(logN)        | O(1) average  |

---

## Map Family Comparison

| Feature            | Map            | Multimap       | Unordered Map |
| ------------------ | -------------- | -------------- | ------------- |
| Duplicate Keys     | No             | Yes            | No            |
| Sorted             | Yes            | Yes            | No            |
| Internal Structure | Red Black Tree | Red Black Tree | Hash Table    |
| Search             | O(logN)        | O(logN)        | O(1) average  |

---

## Complexity Master Table

### Arrays

| Operation | Complexity |
| --------- | ---------- |
| Access    | O(1)       |
| Insert    | O(N)       |
| Delete    | O(N)       |

---

### Vector

| Operation     | Complexity     |
| ------------- | -------------- |
| Access        | O(1)           |
| Push Back     | O(1) amortized |
| Insert Middle | O(N)           |
| Delete Middle | O(N)           |

---

### List

| Operation | Complexity |
| --------- | ---------- |
| Access    | O(N)       |
| Insert    | O(1)       |
| Delete    | O(1)       |

---

### Deque

| Operation  | Complexity |
| ---------- | ---------- |
| Push Front | O(1)       |
| Push Back  | O(1)       |
| Access     | O(1)       |

---

### Stack

| Operation | Complexity |
| --------- | ---------- |
| Push      | O(1)       |
| Pop       | O(1)       |
| Top       | O(1)       |

---

### Queue

| Operation | Complexity |
| --------- | ---------- |
| Push      | O(1)       |
| Pop       | O(1)       |
| Front     | O(1)       |

---

### Priority Queue

| Operation | Complexity |
| --------- | ---------- |
| Push      | O(logN)    |
| Pop       | O(logN)    |
| Top       | O(1)       |

---

### Set

| Operation | Complexity |
| --------- | ---------- |
| Insert    | O(logN)    |
| Delete    | O(logN)    |
| Find      | O(logN)    |

---

### Unordered Set

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Insert    | O(1)    | O(N)  |
| Search    | O(1)    | O(N)  |

---

### Map

| Operation | Complexity |
| --------- | ---------- |
| Insert    | O(logN)    |
| Search    | O(logN)    |
| Delete    | O(logN)    |

---

### Unordered Map

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Insert    | O(1)    | O(N)  |
| Search    | O(1)    | O(N)  |

---

## Common Bugs and Debugging Tips

---

### Bug 1: Dereferencing end()

Wrong:

```cpp
set<int> st={1,2,3};

auto it=st.find(10);

cout<<*it;
```

Problem:

```cpp
find()
```

returns:

```cpp
st.end()
```

Fix:

```cpp
if(it!=st.end())
{
    cout<<*it;
}
```

---

### Bug 2: Modifying Copy in Range Loop

Wrong:

```cpp
vector<int> v={1,2,3};

for(auto x:v)
{
    x+=5;
}
```

Output:

```text
1 2 3
```

Reason:

```cpp
x
```

is copied.

Fix:

```cpp
for(auto &x:v)
{
    x+=5;
}
```

---

### Bug 3: Vector Iterator Invalidation

Wrong:

```cpp
vector<int> v;

v.push_back(1);

auto it=v.begin();

v.push_back(2);

cout<<*it;
```

Problem:

Memory reallocation may occur.

Fix:

Recalculate iterator.

---

### Bug 4: Accessing Empty Stack

Wrong:

```cpp
stack<int> st;

cout<<st.top();
```

Fix:

```cpp
if(!st.empty())
{
    cout<<st.top();
}
```

---

### Bug 5: Accessing Empty Queue

Wrong:

```cpp
queue<int> q;

cout<<q.front();
```

Fix:

```cpp
if(!q.empty())
{
    cout<<q.front();
}
```

---

### Bug 6: Unexpected Key Insertion

Wrong:

```cpp
map<int,int> mp;

cout<<mp[100];
```

Problem:

Creates:

```text
100 → 0
```

Fix:

```cpp
auto it=mp.find(100);

if(it!=mp.end())
{
    cout<<it->second;
}
```

---

## Best Practices

### General Rules

#### Rule 1

Use:

```cpp
vector
```

by default.

Reason:

- Cache friendly
- Fast
- Less memory

---

#### Rule 2

Use:

```cpp
unordered_map
```

when ordering unnecessary.

Reason:

Average:

```text
O(1)
```

lookup.

---

#### Rule 3

Use:

```cpp
map
```

only when sorted keys needed.

---

#### Rule 4

Prefer:

```cpp
emplace()
```

for objects.

---

#### Rule 5

Use:

```cpp
const &
```

for large objects.

Example:

```cpp
for(const auto &x:v)
{
    cout<<x;
}
```

---

#### Rule 6

Reserve vector memory if size known.

```cpp
vector<int> v;

v.reserve(100000);
```

Avoids repeated reallocations.

---

## Real-world Applications

---

### Vector

Used in:

- Game engines
- Graphics rendering
- Dynamic storage
- APIs

---

### Stack

Used in:

- Browser history
- DFS
- Expression evaluation
- Undo systems

---

### Queue

Used in:

- BFS
- CPU scheduling
- Printing systems

---

### Priority Queue

Used in:

- Dijkstra
- AI pathfinding
- Scheduling

---

### Map

Used in:

- Databases
- Caching
- Dictionaries

---

### Set

Used in:

- Duplicate removal
- Unique ID storage

---

## Frequently Asked Interview Questions

---

### Beginner Level

#### Q1

Difference between vector and array?

Answer:

| Array         | Vector           |
| ------------- | ---------------- |
| Fixed size    | Dynamic size     |
| Manual memory | Automatic resize |

---

#### Q2

Difference between push_back() and emplace_back()?

Answer:

```text
push_back:

Create then insert

emplace_back:

Construct directly
```

---

#### Q3

Difference between begin() and end()

Answer:

```text
begin()

Points first element

end()

Points after last element
```

---

### Intermediate Level

#### Q4

Why vector insertion in middle takes O(N)?

Answer:

Elements shift.

---

#### Q5

Why unordered_map worst case becomes O(N)?

Answer:

Hash collisions.

---

#### Q6

Why priority queue insertion is O(logN)?

Answer:

Heapify operation.

---

### Advanced Level

#### Q7

Why vector is usually preferred over list even though insertion in list is O(1)?

Answer:

Vector advantages:

- Cache locality
- Better CPU performance
- Less memory overhead

List theoretically wins in insertion but often loses in real systems.

---

#### Q8

What is cache locality?

Answer:

Continuous memory improves CPU cache performance.

---

#### Q9

What causes iterator invalidation?

Answer:

Memory reallocation.

---

#### Q10

Why does map use Red Black Tree instead of BST?

Answer:

Normal BST:

```text
Worst:

O(N)
```

Balanced tree:

```text
O(logN)
```

---

## Final STL Cheat Sheet

```cpp
vector<int> v;

v.push_back(10);

v.emplace_back(20);

v.erase(v.begin());

v.insert(v.begin(),100);


stack<int> st;

st.push(10);

st.top();

st.pop();


queue<int> q;

q.push(10);

q.front();

q.back();


priority_queue<int> pq;

pq.push(10);

pq.top();


set<int> stt;

stt.insert(10);

stt.find(10);


unordered_set<int> us;


map<int,int> mp;

mp[1]=100;


unordered_map<int,int> ump;


sort(v.begin(),v.end());

sort(
v.begin(),
v.end(),
greater<int>()
);


__builtin_popcount(x);

next_permutation(
s.begin(),
s.end()
);


*max_element(
arr,
arr+n
);

*min_element(
arr,
arr+n
);
```

---

## Final Key Takeaways

1. Vector should usually be the first choice
2. Use unordered containers for speed
3. Use ordered containers when sorting needed
4. Understand internal implementation
5. Complexity alone does not determine performance
6. Cache locality matters
7. Avoid iterator invalidation bugs
8. Always check empty containers
9. Prefer references over unnecessary copies
10. Understand why STL exists instead of memorizing syntax

---

## Final Summary

STL is not a collection of random functions.

STL is a set of optimized data structures and algorithms designed around specific tradeoffs:

- speed
- memory
- flexibility
- maintainability

Choosing the correct container is often more important than writing clever code.

Understanding internal behavior, complexity, and real-world tradeoffs turns STL from syntax memorization into engineering knowledge.

---

