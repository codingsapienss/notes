---
sidebar_label: "Dynamic Containers"
---

# Dynamic Containers

**Topics Covered**

- Deep Vector Operations
- `insert()`
- `erase()`
- `clear()`
- `empty()`
- `swap()`
- Nested Vectors
- Iterator Invalidation
- List
- Internal Working of List
- List vs Vector
- Deque
- Internal Working of Deque
- Vector vs List vs Deque
- Time Complexity Analysis
- Common Bugs
- Best Practices
- Interview Questions

---

## Deep Dive Into Vector

In Part 1 we learned:

- Vector is a dynamic array
- Stores data in contiguous memory
- Size can grow automatically

Now we will study real operations and understand what happens internally.

---

## Vector Insert Operation

### Intuition

Suppose:

```text
10 20 30 40
```

You want:

```text
10 100 20 30 40
```

Insertion in vector is expensive because vector stores elements continuously.

---

### Syntax

#### Insert single element

```cpp
v.insert(position,value);
```

---

#### Example

```cpp
#include<iostream>
#include<vector>

using namespace std;

int main()
{
    vector<int> v={10,20,30};

    v.insert(v.begin()+1,100);

    for(auto x:v)
    {
        cout<<x<<" ";
    }

}
```

Output:

```text
10 100 20 30
```

---

### Internal Working

Initial memory:

```text
Index:

0   1   2

10  20  30
```

Insert:

```cpp
v.insert(v.begin()+1,100)
```

Process:

```text
Step 1:

Move 30 right

10 20 _ 30

Step 2:

Move 20 right

10 _ 20 30

Step 3:

Insert 100

10 100 20 30
```

---

### Time Complexity

| Position  | Complexity     |
| --------- | -------------- |
| Beginning | O(N)           |
| Middle    | O(N)           |
| End       | O(1) amortized |

---

## Insert Multiple Same Values

Syntax:

```cpp
v.insert(position,count,value);
```

Example:

```cpp
vector<int> v={1,2,3};

v.insert(v.begin(),3,100);
```

Output:

```text
100 100 100 1 2 3
```

---

## Insert Another Vector

Syntax:

```cpp
v.insert(position,v2.begin(),v2.end());
```

Example:

```cpp
vector<int> v1={1,2};

vector<int> v2={10,20,30};

v1.insert(v1.end(),v2.begin(),v2.end());
```

Output:

```text
1 2 10 20 30
```

---

## Wrong Approach

```cpp
vector<int> v={1,2,3};

v.insert(v.begin()+100,50);
```

Problem:

Position does not exist.

Undefined behavior.

---

## Correct Approach

```cpp
if(index<v.size())
{
    v.insert(v.begin()+index,50);
}
```

---

## Vector Erase

### Syntax

Remove one element:

```cpp
v.erase(position);
```

Remove range:

```cpp
v.erase(start,end);
```

---

### Remove Single Element

```cpp
vector<int> v={10,20,30,40};

v.erase(v.begin()+1);
```

Output:

```text
10 30 40
```

---

### Internal Working

Before:

```text
10 20 30 40
```

Delete:

```text
20
```

Process:

```text
Move 30 left

Move 40 left
```

Result:

```text
10 30 40
```

---

### Remove Multiple Elements

```cpp
vector<int> v={1,2,3,4,5};

v.erase(v.begin(),v.begin()+2);
```

Output:

```text
3 4 5
```

---

### Important Rule

Range format:

```cpp
[start,end)
```

End excluded.

---

## pop_back()

Removes last element.

Syntax:

```cpp
v.pop_back();
```

Example:

```cpp
vector<int> v={10,20,30};

v.pop_back();
```

Output:

```text
10 20
```

Complexity:

```text
O(1)
```

---

## size()

Returns number of elements.

```cpp
cout<<v.size();
```

---

## clear()

Deletes all elements.

Syntax:

```cpp
v.clear();
```

Example:

```cpp
vector<int> v={1,2,3};

v.clear();

cout<<v.size();
```

Output:

```text
0
```

---

### Hidden Detail

`clear()` removes elements.

But capacity may remain.

Example:

```cpp
vector<int> v={1,2,3,4,5};

cout<<v.capacity();

v.clear();

cout<<v.capacity();
```

Possible output:

```text
8
8
```

Memory may still exist.

---

## empty()

Checks if vector contains elements.

Syntax:

```cpp
v.empty()
```

Returns:

```cpp
true
false
```

---

Example:

```cpp
if(v.empty())
{
    cout<<"Empty";
}
```

---

## swap()

Swaps content.

Syntax:

```cpp
v1.swap(v2);
```

Example:

```cpp
vector<int> v1={1,2};

vector<int> v2={10,20};

v1.swap(v2);
```

Output:

```text
v1:

10 20

v2:

1 2
```

Complexity:

```text
O(1)
```

Because internal pointers swap.

---

## Nested Vectors

### Definition

Vector inside vector.

Syntax:

```cpp
vector<vector<int>> matrix;
```

---

### Example

```cpp
#include<iostream>
#include<vector>

using namespace std;

int main()
{
    vector<vector<int>> matrix=
    {
        {1,2,3},
        {4,5,6},
        {7,8,9}
    };

    for(auto row:matrix)
    {
        for(auto value:row)
        {
            cout<<value<<" ";
        }

        cout<<endl;
    }
}
```

Output:

```text
1 2 3
4 5 6
7 8 9
```

---

### Memory Representation

```text
matrix

↓

Row1 → [1 2 3]

↓

Row2 → [4 5 6]

↓

Row3 → [7 8 9]
```

Rows themselves are vectors.

Memory is not necessarily one continuous block.

---

## Iterator Invalidation

### Definition

Sometimes vector reallocation changes memory address.

Existing iterators become invalid.

---

Example:

```cpp
vector<int> v;

v.push_back(1);

auto it=v.begin();

v.push_back(2);

cout<<*it;
```

Problem:

Memory may have changed.

---

Memory before:

```text
1000:

1
```

After reallocation:

```text
2000:

1 2
```

Iterator still points:

```text
1000
```

Invalid.

---

## List

### Definition

List internally uses:

```text
Doubly Linked List
```

---

## Internal Working

Node structure:

```text
Previous Pointer | Data | Next Pointer
```

Example:

```text
NULL <- [10] <-> [20] <-> [30] -> NULL
```

---

### Why List Exists

Problem in vector:

Middle insertion:

```text
O(N)
```

List solves this.

---

## Syntax

```cpp
list<int> ls;
```

Header:

```cpp
#include<list>
```

---

## push_front()

```cpp
ls.push_front(10);
```

---

## emplace_front()

```cpp
ls.emplace_front(20);
```

---

## push_back()

```cpp
ls.push_back(50);
```

---

## Example

```cpp
#include<iostream>
#include<list>

using namespace std;

int main()
{
    list<int> ls;

    ls.push_back(20);

    ls.push_front(10);

    ls.push_back(30);

    for(auto x:ls)
    {
        cout<<x<<" ";
    }
}
```

Output:

```text
10 20 30
```

---

## Why Insert Is Faster In List

Vector:

```text
10 20 30 40

Insert 50 at beginning

Shift all elements
```

Cost:

```text
O(N)
```

---

List:

```text
10 <->20<->30
```

Insert:

```text
Change pointers only
```

Cost:

```text
O(1)
```

---

## List vs Vector

| Feature        | Vector     | List           |
| -------------- | ---------- | -------------- |
| Memory         | Contiguous | Non-contiguous |
| Access         | O(1)       | O(N)           |
| Insert Middle  | O(N)       | O(1)           |
| Cache Friendly | Yes        | No             |
| Memory Usage   | Less       | More           |

---

## Deque

### Definition

Deque:

```text
Double Ended Queue
```

Supports insertion/removal from both ends.

---

### Internal Working

Deque is not a linked list.

Internally:

```text
Array of fixed-size memory blocks
```

Representation:

```text
Block1

10 20 30

↓

Block2

40 50 60
```

---

### Why Deque Exists

Vector problem:

```cpp
v.push_front()
```

Very expensive.

Deque solves:

```cpp
push_front()

push_back()
```

efficiently.

---

## Syntax

```cpp
deque<int> dq;
```

Header:

```cpp
#include<deque>
```

---

## Operations

```cpp
dq.push_back(10);

dq.push_front(20);

dq.emplace_front(30);

dq.emplace_back(40);

dq.front();

dq.back();

dq.pop_front();

dq.pop_back();
```

---

## Example

```cpp
#include<iostream>
#include<deque>

using namespace std;

int main()
{
    deque<int> dq;

    dq.push_back(20);

    dq.push_front(10);

    dq.push_back(30);

    for(auto x:dq)
    {
        cout<<x<<" ";
    }
}
```

Output:

```text
10 20 30
```

---

## Vector vs List vs Deque

| Feature       | Vector | List | Deque  |
| ------------- | ------ | ---- | ------ |
| Random Access | O(1)   | O(N) | O(1)   |
| Push Front    | O(N)   | O(1) | O(1)   |
| Push Back     | O(1)   | O(1) | O(1)   |
| Middle Insert | O(N)   | O(1) | O(N)   |
| Memory Usage  | Low    | High | Medium |

---

## Common Bugs

### Bug 1

```cpp
auto it=v.begin();

v.push_back(10);

cout<<*it;
```

Reason:

Iterator invalidation.

---

### Bug 2

```cpp
for(auto x:v)
{
    v.push_back(100);
}
```

Reason:

Container modified while iterating.

---

### Fix

```cpp
int n=v.size();

for(int i=0;i<n;i++)
{
    v.push_back(100);
}
```

---

## Best Practices

- Use vector by default
- Use list only when frequent middle insertion/deletion exists
- Use deque when insertion/removal from both ends required
- Avoid storing huge objects by value
- Use `reserve()` when expected size known
- Prefer `emplace_back()` for complex objects

---

## Interview Questions

### Q1

Why is vector insertion expensive?

Answer:

Elements must shift and reallocation may happen.

---

### Q2

Why does list consume more memory?

Answer:

Each node stores:

- data
- previous pointer
- next pointer

---

### Q3

Why is deque faster than vector for front insertion?

Answer:

Deque manages memory in blocks instead of shifting all elements.

---

### Q4

Should list always replace vector?

Answer:

No.

Vector is usually faster because of:

- cache locality
- contiguous memory
- lower memory overhead

---

## Cheat Sheet

```cpp
vector<int> v;

v.insert(v.begin(),100);

v.erase(v.begin());

v.pop_back();

v.clear();

v.empty();

v.swap(v2);

list<int> ls;

ls.push_front(10);

ls.push_back(20);

deque<int> dq;

dq.push_front(10);

dq.push_back(20);

dq.front();

dq.back();
```

---

## Key Takeaways

- Vector insertion in middle is expensive
- `erase()` shifts elements
- `clear()` removes elements but may keep capacity
- Iterator invalidation is important
- List uses doubly linked list
- Deque uses block-based memory
- Vector should generally be default choice

---
