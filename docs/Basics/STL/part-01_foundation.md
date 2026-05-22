---
slug: /
sidebar_label: 'Foundation'
sidebar_position: 1
---

# C++ STL Handbook — Part 1 Foundations

**Topics Covered**

- Arrays
- Array Initialization
- Array Properties
- Array Iteration Methods
- Pair
- Vector Fundamentals
- Vector Internal Working
- Size vs Capacity
- Iterators
- `auto`
- `const`
- Range-based loops (`for-each`)

---

# Arrays

## Intuition

Suppose you have marks of 5 students:

```text
90
85
78
92
88
```

One approach:

```cpp
int a=90;
int b=85;
int c=78;
int d=92;
int e=88;
```

Problems:

- Too many variables
- Hard to maintain
- Difficult to process with loops
- Difficult to scale

Arrays solve this problem.

Arrays allow us to store multiple values under a single variable name.

Real-world analogy:

```text
Apartment Building

Room 0 → Person A
Room 1 → Person B
Room 2 → Person C
Room 3 → Person D
```

Similarly:

```text
arr[0] → 10
arr[1] → 20
arr[2] → 30
arr[3] → 40
```

---

## Definition

Array is a collection of elements of the same data type stored in **contiguous memory locations**.

---

## Why Arrays Exist

Arrays solve:

- Storage organization
- Fast access
- Efficient memory use
- Easy iteration

---

## Internal Working

Array stores elements continuously in memory.

Example:

```cpp
int arr[4]={10,20,30,40};
```

Memory representation:

```text
Address      Value

1000         10
1004         20
1008         30
1012         40
```

Since:

```cpp
sizeof(int)=4 bytes
```

Address calculation:

```text
Address of element

= Base Address + (Index × Size of datatype)
```

Accessing:

```cpp
arr[2]
```

Compiler converts internally:

```cpp
*(arr+2)
```

Calculation:

```text
1000 + (2×4)

1008
```

Value:

```text
30
```

---

## Why Array Access Is Fast

Array indexing:

```cpp
arr[index]
```

requires direct address calculation.

No traversal needed.

Time complexity:

| Operation | Complexity |
|------------|-------------|
| Access | O(1) |

---

# Syntax

```cpp
datatype arrayName[size];
```

Example:

```cpp
int arr[5];
```

---

# Array Initialization

## Method 1

```cpp
int arr[5]={1,2,3,4,5};
```

---

## Method 2

Compiler automatically calculates size.

```cpp
int arr[]={1,2,3,4};
```

---

## Method 3

Initialize all values with zero.

```cpp
int arr[5]={0};
```

Output:

```text
0 0 0 0 0
```

---

## Method 4

Partial initialization

```cpp
int arr[5]={1,2};
```

Output:

```text
1 2 0 0 0
```

Remaining values become:

```cpp
0
```

---

# Basic Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int arr[5]={10,20,30,40,50};

    cout<<arr[0]<<endl;
    cout<<arr[2]<<endl;
    cout<<arr[4];

    return 0;
}
```

## Code Explanation

```cpp
int arr[5]
```

Creates an array of size 5.

```cpp
arr[0]
```

Accesses first element.

```cpp
arr[2]
```

Accesses third element.

Execution:

```text
arr[0] → 10

arr[2] → 30

arr[4] → 50
```

---

# Array Properties

| Property | Value |
|-----------|--------|
| Memory Layout | Contiguous |
| Size | Fixed |
| Random Access | Yes |
| Dynamic Resize | No |
| Insert Middle | O(N) |
| Delete Middle | O(N) |
| Access | O(1) |

---

# Array Iteration Methods

---

## Method 1 — Traditional Loop

```cpp
#include<iostream>
using namespace std;

int main()
{
    int arr[]={1,2,3,4,5};

    for(int i=0;i<5;i++)
    {
        cout<<arr[i]<<" ";
    }
}
```

Output:

```text
1 2 3 4 5
```

---

## Method 2 — Pointer Iteration

```cpp
#include<iostream>
using namespace std;

int main()
{
    int arr[]={10,20,30};

    for(int i=0;i<3;i++)
    {
        cout<<*(arr+i)<<" ";
    }
}
```

Explanation:

```cpp
arr+i
```

moves pointer.

```cpp
*(arr+i)
```

dereferences pointer.

---

## Method 3 — Range-based Loop

```cpp
#include<iostream>
using namespace std;

int main()
{
    int arr[]={5,6,7};

    for(auto x:arr)
    {
        cout<<x<<" ";
    }
}
```

Output:

```text
5 6 7
```

---

# Pair

## Intuition

Suppose:

```text
Student ID → Marks

101 → 90
102 → 85
103 → 76
```

Using separate arrays:

```cpp
int id[3];
int marks[3];
```

This becomes difficult.

Pair combines two related values.

---

## Definition

Pair stores two values together.

Header:

```cpp
#include<utility>
```

---

## Syntax

```cpp
pair<int,int> p;
```

---

## Assign Values

```cpp
pair<int,int> p;

p={1,2};
```

Access:

```cpp
cout<<p.first;

cout<<p.second;
```

---

## Basic Example

```cpp
#include<iostream>
#include<utility>

using namespace std;

int main()
{
    pair<int,int> p={10,20};

    cout<<p.first<<endl;

    cout<<p.second;
}
```

Output:

```text
10
20
```

---

## Nested Pair

```cpp
pair<int,pair<int,int>> p;

p={1,{2,3}};

cout<<p.second.second;
```

Output:

```text
3
```

---

## Array of Pairs

```cpp
pair<int,int> arr[]=
{
    {1,2},
    {3,4},
    {5,6}
};

cout<<arr[1].second;
```

Output:

```text
4
```

---

# Vector

## Intuition

Arrays have a limitation:

```text
Fixed size
```

Problem:

```cpp
int arr[100];
```

Case 1:

Need only:

```text
5 elements
```

Memory wasted.

Case 2:

Need:

```text
150 elements
```

Not enough memory.

Vector solves this problem.

---

# Important Correction

Wrong:

```text
Vector internally uses linked list
```

Correct:

```text
Vector internally uses dynamic contiguous memory
```

Vector internally behaves like a resizable array.

---

# Internal Working

Initially:

```cpp
vector<int> v;
```

Memory:

```text
Size = 0
Capacity = 0
```

---

Insert:

```cpp
v.push_back(10);
```

Memory:

```text
10
```

Size:

```text
1
```

Capacity:

```text
1
```

---

Insert:

```cpp
v.push_back(20);
```

Memory:

```text
10 20
```

Size:

```text
2
```

Capacity:

```text
2
```

---

Insert:

```cpp
v.push_back(30);
```

Vector becomes full.

New memory allocation:

```text
Old memory:

10 20

↓

New memory:

10 20 30 _
```

Capacity grows.

Usually:

```text
1

↓

2

↓

4

↓

8

↓

16
```

---

# Size vs Capacity

| Size | Capacity |
|--------|----------|
| Actual elements | Allocated memory |

Example:

```cpp
vector<int> v;

v.push_back(1);
v.push_back(2);
v.push_back(3);

cout<<v.size();
cout<<v.capacity();
```

Possible output:

```text
3
4
```

---

# Vector Initialization

## Empty Vector

```cpp
vector<int> v;
```

---

## Fixed Size

```cpp
vector<int> v(5);
```

Output:

```text
0 0 0 0 0
```

---

## Fixed Size With Value

```cpp
vector<int> v(5,100);
```

Output:

```text
100 100 100 100 100
```

---

## Copy Vector

```cpp
vector<int> v1={1,2,3};

vector<int> v2(v1);
```

---

# Element Access

```cpp
cout<<v[0];

cout<<v.at(1);

cout<<v.back();
```

---

# Push Back vs Emplace Back

## push_back()

Creates object first.

Then inserts.

```cpp
v.push_back(10);
```

---

## emplace_back()

Constructs object directly inside memory.

```cpp
v.emplace_back(10);
```

---

## Example

```cpp
vector<pair<int,int>> v;

v.push_back({1,2});

v.emplace_back(3,4);
```

---

## Should We Always Use emplace_back() ?

No.

For:

```cpp
int
char
double
```

Difference is negligible.

More useful for:

- classes
- objects
- complex data structures

---

# Iterators

## Definition

Iterator behaves like a pointer.

Used for traversing containers.

---

## Syntax

```cpp
vector<int>::iterator it=v.begin();
```

Using auto:

```cpp
auto it=v.begin();
```

---

## begin()

Points to first element.

```text
10 20 30 40
↑
begin()
```

---

## end()

Does NOT point to last element.

Points after last element.

```text
10 20 30 40
            ↑
          end()
```

---

## rbegin()

```text
10 20 30 40
            ↑
        rbegin()
```

---

## rend()

```text
10 20 30 40
↑
rend()
```

---

## Reverse Iterator Increment

```cpp
auto it=v.rbegin();

it++;
```

Movement:

```text
40 → 30 → 20 → 10
```

---

# Iterator Loop

```cpp
for(auto it=v.begin();it!=v.end();it++)
{
    cout<<*it<<" ";
}
```

---

# Reverse Loop

```cpp
for(auto it=v.rbegin();it!=v.rend();it++)
{
    cout<<*it<<" ";
}
```

---

# auto

## Why use auto

Without auto:

```cpp
vector<pair<int,int>>::iterator it=v.begin();
```

Large declaration.

Using auto:

```cpp
auto it=v.begin();
```

Compiler detects type automatically.

---

# const

Prevents modification.

Example:

```cpp
const int x=10;
```

Wrong:

```cpp
x=20;
```

Compiler error.

---

Using const reference:

```cpp
for(const auto &x:v)
{
    cout<<x;
}
```

Benefits:

- No copying
- No modification
- Better performance

---

# Range-based Loop

Syntax:

```cpp
for(auto x:v)
{

}
```

---

## Hidden Behavior

Wrong:

```cpp
for(auto x:v)
{
    x+=5;
}
```

No change occurs.

Reason:

```cpp
x
```

is copied.

Correct:

```cpp
for(auto &x:v)
{
    x+=5;
}
```

---

# Complexity Summary

| Operation | Array | Vector |
|------------|--------|---------|
| Access | O(1) | O(1) |
| Insert End | N/A | O(1) amortized |
| Delete End | N/A | O(1) |
| Insert Middle | O(N) | O(N) |
| Delete Middle | O(N) | O(N) |

---

# Common Mistakes

## Mistake 1

```cpp
auto it=v.end();

cout<<*it;
```

Problem:

```cpp
end()
```

points after last element.

Undefined behavior.

---

## Mistake 2

```cpp
for(auto x:v)
{
    x++;
}
```

Only copy modified.

---

## Mistake 3

```cpp
int arr[5];

cout<<arr[0];
```

Contains garbage value.

---

# Interview Questions

## Q1

Why vector indexing is O(1)?

Answer:

Because vector stores elements in contiguous memory.

---

## Q2

Difference between size and capacity?

Answer:

Size:

Actual elements

Capacity:

Allocated memory

---

## Q3

Why insertion in middle of vector is expensive?

Answer:

Elements must shift.

Complexity:

```text
O(N)
```

---

# Cheat Sheet

```cpp
vector<int> v;

v.push_back(10);

v.emplace_back(20);

v.begin();

v.end();

v.rbegin();

v.rend();

v.back();

v.size();

pair<int,int> p={1,2};

p.first;

p.second;
```

---

# Key Takeaways

- Arrays use contiguous memory
- Vector uses dynamic contiguous memory
- Vector is not linked list
- Size and capacity are different
- end() points after last element
- auto reduces verbosity
- const prevents modifications
- Range loops may create copies

---

# End of Part 1