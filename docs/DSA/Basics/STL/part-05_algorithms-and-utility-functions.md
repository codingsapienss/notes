---
sidebar_label: 'Algorithms & Utilities'
---

# C++ STL: Algorithms and Utility Functions

**Topics Covered**

- Introduction to STL Algorithms
- `sort()`
- Sorting Arrays
- Sorting Vectors
- Sorting Partial Ranges
- Sorting in Descending Order
- Custom Comparators
- Sorting Pairs
- Internal Working of Sort
- `__builtin_popcount()`
- `__builtin_popcountll()`
- `next_permutation()`
- Print All Permutations
- `max_element()`
- `min_element()`
- Complexity Analysis
- Real-world Applications
- Common Bugs
- Interview Questions
- Cheat Sheet

---

## Introduction to STL Algorithms

### Intuition

Suppose you have:

```cpp
int arr[]={5,2,7,1,3};
```

Without STL:

```cpp
- Write sorting algorithm
- Write searching algorithm
- Write max logic
- Write permutation logic
```

Problems:

- Time consuming
- More bugs
- Reinventing existing solutions

STL algorithms solve this.

---

## Why Algorithms Exist

Algorithms provide:

- Optimized implementations
- Less code
- Better readability
- Reduced bugs
- High performance

---

## sort()

### Definition

Used for sorting containers.

Header:

```cpp
#include<algorithm>
```

---

## Sorting Arrays

### Syntax

```cpp
sort(arr,arr+n);
```

---

### Example

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

int main()
{
    int arr[]={5,2,8,1,9};

    int n=5;

    sort(arr,arr+n);

    for(int x:arr)
    {
        cout<<x<<" ";
    }
}
```

Output:

```text
1 2 5 8 9
```

---

### Code Explanation

```cpp
sort(arr,arr+n);
```

Start:

```cpp
arr
```

points to:

```text
First element
```

End:

```cpp
arr+n
```

points:

```text
One position after last element
```

Range:

```text
[start,end)
```

---

## Sorting Vector

Syntax:

```cpp
sort(v.begin(),v.end());
```

---

Example

```cpp
vector<int> v={4,1,8,2};

sort(v.begin(),v.end());

for(auto x:v)
{
    cout<<x<<" ";
}
```

Output:

```text
1 2 4 8
```

---

## Sorting Particular Portion

Syntax:

```cpp
sort(start,end);
```

---

Example

```cpp
int arr[]={7,4,2,9,1};

sort(arr+1,arr+4);
```

Before:

```text
7 4 2 9 1
```

Sorted portion:

```text
4 2 9
```

Output:

```text
7 2 4 9 1
```

---

## Sorting Descending Order

### Syntax

```cpp
sort(arr,arr+n,greater<int>());
```

---

Example

```cpp
int arr[]={5,2,8,1};

sort(arr,arr+4,greater<int>());

for(int x:arr)
{
    cout<<x<<" ";
}
```

Output:

```text
8 5 2 1
```

---

## Internal Working of sort()

STL sort internally uses:

```text
IntroSort
```

IntroSort combines:

```text
Quick Sort
        +
Heap Sort
        +
Insertion Sort
```

---

## Why Not Only Quick Sort?

Quick sort worst case:

```text
O(N²)
```

IntroSort avoids that.

---

## Complexity

| Case    | Complexity |
| ------- | ---------- |
| Best    | O(NlogN)   |
| Average | O(NlogN)   |
| Worst   | O(NlogN)   |

---

## Custom Comparator

### Why Custom Sorting?

Default sorting:

```text
Ascending
```

Sometimes requirements differ.

Example:

```text
Sort by second value

If second equal:

Sort first in descending
```

---

## Example

Input:

```cpp
pair<int,int> arr[]=
{
    {1,2},
    {2,1},
    {4,1}
};
```

Requirement:

```text
Sort by second

If same:

Sort first descending
```

---

## Comparator Function

```cpp
bool comp(
pair<int,int> p1,
pair<int,int> p2)
{

    if(p1.second<p2.second)
        return true;

    if(p1.second>p2.second)
        return false;

    return p1.first>p2.first;

}
```

---

## Use Comparator

```cpp
sort(arr,arr+3,comp);
```

Output:

```text
4 1

2 1

1 2
```

---

## How Comparator Works

Rule:

```cpp
return true
```

means:

```text
Keep first element before second
```

---

## Wrong Comparator

Wrong:

```cpp
bool comp(int a,int b)
{
    return a>=b;
}
```

Reason:

Comparator should satisfy:

```text
Strict Weak Ordering
```

Use:

```cpp
return a>b;
```

instead.

---

## \_\_builtin_popcount()

### Definition

Returns:

```text
Number of set bits
```

Set bit:

```text
Bit = 1
```

---

Example:

```cpp
int num=7;

cout<<__builtin_popcount(num);
```

Binary:

```text
7

111
```

Output:

```text
3
```

---

## Internal Working

Binary:

```text
13

1101
```

Count:

```text
1+1+0+1
```

Output:

```text
3
```

---

## \_\_builtin_popcountll()

Used for:

```cpp
long long
```

Example:

```cpp
long long num=123456789123;

cout<<__builtin_popcountll(num);
```

---

## Why Separate Function?

Normal:

```cpp
__builtin_popcount()
```

works on:

```cpp
int
```

Range:

```text
32 bits
```

Long long:

```text
64 bits
```

---

## next_permutation()

### Definition

Creates next lexicographically larger permutation.

---

### Syntax

```cpp
next_permutation(
s.begin(),
s.end()
);
```

---

Example

```cpp
string s="123";

next_permutation(
s.begin(),
s.end()
);

cout<<s;
```

Output:

```text
132
```

---

## Internal Working

Input:

```text
123
```

Permutations:

```text
123
132
213
231
312
321
```

Next after:

```text
123
```

is:

```text
132
```

---

## Print All Permutations

Important rule:

Always sort first.

---

Example

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

int main()
{
    string s="321";

    sort(s.begin(),s.end());

    do
    {
        cout<<s<<endl;

    }
    while(
    next_permutation(
    s.begin(),
    s.end()
    ));

}
```

Output:

```text
123
132
213
231
312
321
```

---

## Why Sort First?

Wrong:

```cpp
string s="321";
```

Output becomes incomplete.

Because:

```cpp
next_permutation()
```

moves forward only.

---

## max_element()

### Definition

Returns iterator pointing to largest element.

---

Syntax:

```cpp
max_element(start,end);
```

---

Example

```cpp
int arr[]={4,7,2,9};

int mx=
*max_element(
arr,
arr+4
);

cout<<mx;
```

Output:

```text
9
```

---

## Internal Working

Process:

```text
Current max=4

7 >4

Current max=7

2<7

9>7

Current max=9
```

---

## min_element()

Returns iterator of minimum element.

---

Example

```cpp
int arr[]={4,7,2,9};

int mn=
*min_element(
arr,
arr+4
);

cout<<mn;
```

Output:

```text
2
```

---

## Time Complexity

| Function         | Complexity        |
| ---------------- | ----------------- |
| sort             | O(NlogN)          |
| max_element      | O(N)              |
| min_element      | O(N)              |
| next_permutation | O(N)              |
| popcount         | O(Number of Bits) |

---

## Real-world Applications

### sort()

Used in:

- Rankings
- Scheduling
- Database ordering
- Search preprocessing

---

### next_permutation()

Used in:

- Backtracking
- Combination generation
- Puzzle solving

---

### popcount()

Used in:

- Bitmasking
- Competitive programming
- Subset problems

---

### max_element()

Used in:

- Finding highest marks
- Analytics
- Statistics

---

## Common Bugs

### Bug 1

Wrong:

```cpp
sort(arr,arr+n-1);
```

Problem:

Last element excluded.

Correct:

```cpp
sort(arr,arr+n);
```

---

### Bug 2

Wrong:

```cpp
max_element(arr,arr+n);
```

Problem:

Returns iterator.

Correct:

```cpp
*max_element(arr,arr+n)
```

---

### Bug 3

Wrong:

```cpp
__builtin_popcount(longLongValue)
```

Use:

```cpp
__builtin_popcountll()
```

---

### Bug 4

Wrong:

```cpp
string s="321";

do
{
    cout<<s;

}
while(next_permutation(
s.begin(),
s.end()
));
```

Output incomplete.

Fix:

```cpp
sort(s.begin(),s.end());
```

---

## Interview Questions

### Q1

What algorithm does STL sort use?

Answer:

```text
IntroSort
```

---

### Q2

Why is IntroSort better than QuickSort?

Answer:

Avoids O(N²) worst case.

---

### Q3

Why does max_element return iterator?

Answer:

Works uniformly with STL containers.

---

### Q4

Why sort before next_permutation?

Answer:

To generate all permutations.

---

### Q5

Difference:

```cpp
__builtin_popcount()

vs

__builtin_popcountll()
```

Answer:

| Function   | Data Type |
| ---------- | --------- |
| popcount   | int       |
| popcountll | long long |

---

## Cheat Sheet

```cpp
sort(arr,arr+n);

sort(v.begin(),v.end());

sort(
arr,
arr+n,
greater<int>()
);

sort(
arr,
arr+n,
comp
);

__builtin_popcount(num);

__builtin_popcountll(num);

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

## Key Takeaways

- STL algorithms reduce code and bugs
- sort() uses IntroSort
- Comparator controls sorting behavior
- popcount counts set bits
- next_permutation generates next lexicographic arrangement
- max_element returns iterator
- Always sort before generating permutations

---

