---
sidebar_label: 'Associative Containers'
---

# C++ STL Handbook — Part 4 Associative Containers

**Topics Covered**

- Associative Containers Introduction
- Set
- Multiset
- Unordered Set
- Map
- Multimap
- Unordered Map
- Internal Working
- Trees vs Hash Tables
- Lower Bound and Upper Bound
- Time Complexities
- When To Use Which
- Real-world Applications
- Common Bugs
- Best Practices
- Interview Questions

---

# Associative Containers

## Intuition

Till now we studied:

- Vector
- List
- Stack
- Queue

These containers mainly focus on storing data.

But often we need:

- Fast searching
- Unique values
- Key-value mapping
- Sorted storage

Associative containers solve these problems.

---

## Main Associative Containers

| Container     | Duplicate Allowed | Sorted | Internal Structure |
| ------------- | ----------------- | ------ | ------------------ |
| Set           | No                | Yes    | Balanced Tree      |
| Multiset      | Yes               | Yes    | Balanced Tree      |
| Unordered Set | No                | No     | Hash Table         |
| Map           | Key unique        | Yes    | Balanced Tree      |
| Multimap      | Key duplicate     | Yes    | Balanced Tree      |
| Unordered Map | Key unique        | No     | Hash Table         |

---

# Set

## Intuition

Suppose:

```text
Input:

10 20 30 20 40 10
```

Requirements:

- Store unique values
- Keep values sorted

Output:

```text
10 20 30 40
```

Set solves this automatically.

---

## Definition

Set stores:

- Unique elements
- Sorted elements

Internally uses:

```text
Balanced Binary Search Tree

Usually Red Black Tree
```

---

## Internal Working

Insert:

```text
30
10
50
20
40
```

Tree:

```text
        30
      /    \
    10      50
      \     /
      20   40
```

Traversal:

```text
10 20 30 40 50
```

---

# Syntax

```cpp
set<int> st;
```

Header:

```cpp
#include<set>
```

---

# Insert

## insert()

```cpp
st.insert(10);

st.insert(20);

st.insert(30);
```

---

## emplace()

```cpp
st.emplace(40);
```

---

# Duplicate Example

```cpp
set<int> st;

st.insert(10);

st.insert(20);

st.insert(10);
```

Stored:

```text
10 20
```

Duplicate skipped automatically.

---

# Traversal

```cpp
for(auto x:st)
{
    cout<<x<<" ";
}
```

Output:

```text
10 20
```

---

# find()

Returns iterator.

Syntax:

```cpp
auto it=st.find(20);
```

If exists:

```text
Points to value
```

If not:

```cpp
st.end()
```

---

Example:

```cpp
if(it!=st.end())
{
    cout<<"Found";
}
```

---

# erase()

Delete element.

```cpp
st.erase(20);
```

---

# count()

Returns:

```text
1 → exists

0 → not exists
```

Example:

```cpp
cout<<st.count(20);
```

---

# lower_bound()

Returns:

```text
First element >= value
```

Example:

```cpp
set<int> st={10,20,30,40};

auto it=st.lower_bound(25);
```

Result:

```text
30
```

---

# upper_bound()

Returns:

```text
First element > value
```

Example:

```cpp
set<int> st={10,20,30,40};

auto it=st.upper_bound(30);
```

Result:

```text
40
```

---

# Complexity

| Operation   | Complexity |
| ----------- | ---------- |
| Insert      | O(logN)    |
| Erase       | O(logN)    |
| Find        | O(logN)    |
| Count       | O(logN)    |
| Lower Bound | O(logN)    |
| Upper Bound | O(logN)    |

---

# Multiset

## Definition

Multiset stores:

- Sorted values
- Duplicate values allowed

Internal structure:

```text
Red Black Tree
```

---

## Example

```cpp
multiset<int> ms;

ms.insert(10);

ms.insert(10);

ms.insert(20);
```

Stored:

```text
10 10 20
```

---

# Erase Problem

```cpp
ms.erase(10);
```

Deletes:

```text
ALL 10 values
```

---

# Delete Single Occurrence

```cpp
ms.erase(ms.find(10));
```

Only first occurrence removed.

---

# Example

```cpp
multiset<int> ms;

ms.insert(10);

ms.insert(10);

ms.insert(20);

ms.erase(ms.find(10));
```

Output:

```text
10 20
```

---

# Unordered Set

## Definition

Stores:

- Unique values
- No ordering

Internally uses:

```text
Hash Table
```

---

## Internal Working

Hash function:

```text
Value → Hash Function → Bucket
```

Example:

```text
12 → bucket 2

25 → bucket 5

31 → bucket 1
```

Storage:

```text
Bucket0

Bucket1 → 31

Bucket2 → 12

Bucket5 → 25
```

---

# Syntax

```cpp
unordered_set<int> st;
```

Header:

```cpp
#include<unordered_set>
```

---

# Example

```cpp
unordered_set<int> st;

st.insert(20);

st.insert(5);

st.insert(100);

for(auto x:st)
{
    cout<<x<<" ";
}
```

Output:

```text
Random order
```

---

# Complexity

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Insert    | O(1)    | O(N)  |
| Search    | O(1)    | O(N)  |
| Erase     | O(1)    | O(N)  |

---

# Why Worst Case O(N)?

Suppose:

Hash function maps everything:

```text
10 → bucket1
20 → bucket1
30 → bucket1
40 → bucket1
```

Collision:

```text
bucket1

10 → 20 → 30 → 40
```

Search becomes:

```text
Linear Search
```

Complexity:

```text
O(N)
```

---

# Map

## Intuition

Suppose:

```text
Roll Number → Marks

101 → 90
102 → 87
103 → 76
```

Map stores:

```text
key → value
```

---

## Definition

Map stores:

- Unique keys
- Values can repeat
- Sorted keys

Internally:

```text
Red Black Tree
```

---

# Syntax

```cpp
map<int,int> mpp;
```

---

# Different Declarations

```cpp
map<int,int> mpp;

map<int,pair<int,int>> mpp;

map<pair<int,int>,int> mpp;
```

---

# Insert

Using indexing:

```cpp
mpp[1]=2;
```

Stored:

```text
1 → 2
```

---

Using insert:

```cpp
mpp.insert({2,4});
```

---

Using emplace:

```cpp
mpp.emplace(3,5);
```

---

# Example

```cpp
#include<iostream>
#include<map>

using namespace std;

int main()
{
    map<int,int> mpp;

    mpp[1]=100;

    mpp[2]=200;

    for(auto it:mpp)
    {
        cout<<it.first<<" "
            <<it.second<<endl;
    }
}
```

Output:

```text
1 100
2 200
```

---

# Important Hidden Behavior

```cpp
cout<<mpp[100];
```

If key doesn't exist:

Map inserts:

```text
100 → 0
```

---

This surprises many developers.

---

# Safe Method

```cpp
auto it=mpp.find(100);

if(it!=mpp.end())
{
    cout<<it->second;
}
```

---

# find()

```cpp
auto it=mpp.find(2);
```

Returns iterator.

---

# Complexity

| Operation | Complexity |
| --------- | ---------- |
| Insert    | O(logN)    |
| Find      | O(logN)    |
| Delete    | O(logN)    |

---

# Multimap

## Definition

Stores:

- Duplicate keys allowed
- Sorted keys

---

## Example

```cpp
multimap<int,string> mp;

mp.insert({1,"A"});

mp.insert({1,"B"});
```

Stored:

```text
1 A

1 B
```

---

## Important Limitation

Wrong:

```cpp
mp[1]="ABC";
```

Not allowed.

Because duplicate keys exist.

---

# Unordered Map

## Definition

Stores:

- Unique keys
- Random order

Internal structure:

```text
Hash Table
```

---

## Syntax

```cpp
unordered_map<int,int> mp;
```

---

## Example

```cpp
unordered_map<int,int> mp;

mp[10]=100;

mp[20]=200;

for(auto x:mp)
{
    cout<<x.first<<" "
        <<x.second<<endl;
}
```

---

# Complexity

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Insert    | O(1)    | O(N)  |
| Search    | O(1)    | O(N)  |
| Delete    | O(1)    | O(N)  |

---

# When To Use Which

| Situation             | Container     |
| --------------------- | ------------- |
| Unique + Sorted       | Set           |
| Duplicate + Sorted    | Multiset      |
| Unique + Fast Search  | Unordered Set |
| Key Value + Sorted    | Map           |
| Duplicate Keys        | Multimap      |
| Fast Key Value Access | Unordered Map |

---

# Real-world Examples

## Set

Used in:

- Unique usernames
- Distinct IDs
- Duplicate removal

---

## Multiset

Used in:

- Frequency systems
- Duplicate rankings
- Event counting

---

## Map

Used in:

- Student databases
- Dictionary systems
- Caching

---

## Unordered Map

Used in:

- Frequency counting
- Fast lookup systems
- Hashing problems

---

# Common Bugs

## Bug 1

Wrong:

```cpp
cout<<mpp[100];
```

Problem:

Creates new key.

---

## Bug 2

Wrong:

```cpp
auto it=st.find(50);

cout<<*it;
```

Problem:

May equal:

```cpp
st.end()
```

---

Fix:

```cpp
if(it!=st.end())
{
    cout<<*it;
}
```

---

## Bug 3

Wrong:

```cpp
unordered_set<int> st;

st.lower_bound(10);
```

Error.

Reason:

Hash table does not maintain order.

---

# Best Practices

- Use unordered containers when sorting unnecessary
- Use set/map when ordering required
- Avoid using map[] only for searching
- Prefer find()
- Use emplace() when possible

---

# Interview Questions

## Q1

Why set stores sorted values?

Answer:

Because internally it uses balanced BST.

---

## Q2

Why unordered_map is faster?

Answer:

Uses hash table.

---

## Q3

Why worst case O(N) in unordered_map?

Answer:

Hash collisions.

---

## Q4

Difference between map and unordered_map?

Answer:

| Map     | Unordered Map |
| ------- | ------------- |
| Sorted  | Random        |
| O(logN) | O(1) average  |
| Tree    | Hash Table    |

---

# Cheat Sheet

```cpp
set<int> st;

st.insert(10);

st.find(10);

st.erase(10);

st.lower_bound(20);


multiset<int> ms;

ms.erase(ms.find(10));


unordered_set<int> us;


map<int,int> mp;

mp[1]=10;

mp.find(1);


multimap<int,int> mm;


unordered_map<int,int> ump;
```

---

# Key Takeaways

- Set stores unique sorted values
- Multiset allows duplicates
- Unordered set uses hashing
- Map stores key-value pairs
- Multimap allows duplicate keys
- Unordered map is generally fastest
- Hash collisions cause O(N)

---

# End of Part 4
