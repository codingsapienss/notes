# How `map` Works Internally (Red-Black Tree)

> ```text
> How does map work internally?
> ```
>
> Understanding its internal implementation helps explain:
>
> - Why keys are automatically sorted
> - Why insertion is O(log N)
> - Why searching is O(log N)
> - Why maps cannot be accessed using an index

---

## How is a map Implemented?

In C++, STL `map` is implemented using a

```text
Self Balancing Binary Search Tree
```

specifically,

```text
Red-Black Tree
```

You do **not** need to know every detail of Red-Black Trees for DSA interviews.

Just remember

```text
map

↓

Red Black Tree

↓

Balanced BST
```

---

## What is a Binary Search Tree (BST)?

A Binary Search Tree follows one simple rule.

```text
Left Child

<

Root

<

Right Child
```

Example

```text
        10
       /  \
      5    15
     / \     \
    2   8     20
```

Notice

```text
2 < 5 < 8 < 10 < 15 < 20
```

---

## Why Use a Balanced Tree?

Suppose we insert

```text
10

20

30

40

50
```

A normal BST becomes

```text
10
 \
 20
   \
   30
     \
     40
       \
       50
```

Height

```text
5
```

Searching

```text
O(N)
```

Very slow.

---

A Red-Black Tree automatically balances itself.

Example

```text
        20
      /    \
    10      40
      \    /
      15 30
```

Height remains small.

Searching

```text
O(log N)
```

---

## Why is map Always Sorted?

Suppose

```cpp
map<int,int> mp;

mp[8] = 1;

mp[2] = 1;

mp[10] = 1;

mp[5] = 1;
```

Inserted order

```text
8

2

10

5
```

Output

```text
2

5

8

10
```

Why?

Because a Binary Search Tree stores values according to

```text
Smaller

↓

Left

Larger

↓

Right
```

When we perform an **inorder traversal**, keys naturally appear in sorted order.

---

## Visual Representation

Inserted

```text
8

2

10

5
```

Possible Tree

```text
        8
      /   \
     2     10
      \
       5
```

Inorder Traversal

```text
2

5

8

10
```

Hence,

```text
map always prints keys in sorted order.
```

---

## Why is Searching O(log N)?

Suppose

```text
Need to find

5
```

Instead of checking every element,

BST compares

```text
5 < 8

↓

Go Left

↓

Found
```

Only a few comparisons are required.

Since the tree remains balanced,

Height

```text
≈ log₂N
```

Therefore

Searching

```text
O(log N)
```

---

## Insertion

Suppose

```cpp
mp[7] = 100;
```

Process

```text
Start at Root

↓

Compare

↓

Move Left/Right

↓

Find Correct Position

↓

Insert

↓

Balance Tree
```

Time Complexity

```text
O(log N)
```

---

## Searching

```cpp
mp.find(10);
```

Process

```text
Root

↓

Compare

↓

Left / Right

↓

Found
```

Time

```text
O(log N)
```

---

## Updating

```cpp
mp[5] = 20;
```

Process

```text
Search Key

↓

Update Value
```

Time

```text
O(log N)
```

---

## Deletion

```cpp
mp.erase(10);
```

Process

```text
Search

↓

Delete Node

↓

Rebalance Tree
```

Time

```text
O(log N)
```

---

## Traversal

```cpp
for(auto x : mp)
```

Internally,

the tree is traversed using

```text
Inorder Traversal
```

Output

```text
Sorted Keys
```

Time

```text
O(N)
```

---

## Why Can't We Access Using an Index?

Arrays

```text
Memory

0

1

2

3

4
```

Continuous memory.

So

```cpp
arr[2]
```

works.

---

A map looks like

```text
        8
      /   \
     2     10
      \
       5
```

Nodes are scattered throughout memory.

There is

```text
No First

No Second

No Third
```

element stored by position.

Instead,

elements are accessed by

```text
Key
```

Therefore,

this is valid

```cpp
mp[8]
```

because

```text
8

↓

Key
```

But

```cpp
mp[2]
```

does **not** mean

```text
Second Element
```

It means

```text
Key = 2
```

---

## Iterators

Since maps are not index-based,

we use

```cpp
iterator
```

to move through the elements.

---

Beginning

```cpp
mp.begin()
```

points to

```text
Smallest Key
```

---

End

```cpp
mp.end()
```

points

```text
One position after
the largest key
```

---

Example

```cpp
for(auto it = mp.begin();
    it != mp.end();
    it++) {

    cout << it->first
         << " "
         << it->second
         << endl;
}
```

---

## lower_bound()

Returns

```text
First key

>= given value
```

Example

Keys

```text
2

5

8

10
```

```cpp
mp.lower_bound(6);
```

Returns

```text
8
```

---

## upper_bound()

Returns

```text
First key

>

given value
```

Example

Keys

```text
2

5

8

10
```

```cpp
mp.upper_bound(8);
```

Returns

```text
10
```

---

## Complexity Table

| Operation     | Time Complexity |
| ------------- | --------------: |
| Insert        |        O(log N) |
| Search        |        O(log N) |
| Update        |        O(log N) |
| Delete        |        O(log N) |
| lower_bound() |        O(log N) |
| upper_bound() |        O(log N) |
| Traversal     |            O(N) |
| begin()       |            O(1) |
| end()         |            O(1) |
| Size          |            O(1) |
| Empty         |            O(1) |

---

## Space Complexity

```text
O(N)
```

Every node stores

- Key
- Value
- Left Pointer
- Right Pointer
- Parent Pointer
- Color Bit (Red/Black)

Therefore,

maps consume more memory than arrays.

---

## Advantages of map

- Automatically sorted.
- Efficient searching.
- Efficient insertion.
- Supports large key ranges.
- Supports custom comparable key types.
- Stable logarithmic performance.

---

## Limitations

- Slower than `unordered_map` on average.
- Uses more memory.
- Cannot access by index.
- Extra balancing operations after insertions and deletions.

---

## Interview Questions

### Q1. How is `map` implemented internally?

**Answer**

`map` is implemented using a **Red-Black Tree**, which is a self-balancing Binary Search Tree.

---

### Q2. Why are map keys always sorted?

**Answer**

Because the underlying Red-Black Tree maintains the Binary Search Tree property, and inorder traversal visits nodes in sorted order.

---

### Q3. Why is insertion O(log N)?

**Answer**

The tree remains balanced, so its height is approximately `log₂N`. Insertion requires traversing the tree and then rebalancing it.

---

### Q4. Why can't we access a map using an index?

**Answer**

A map is a tree-based data structure, not a contiguous array. Elements are organized by keys rather than positions in memory.

---

### Q5. What are `lower_bound()` and `upper_bound()`?

**Answer**

- `lower_bound(x)` returns the first key **greater than or equal to** `x`.
- `upper_bound(x)` returns the first key **strictly greater than** `x`.

---

## Key Takeaways

- STL `map` is implemented using a **Red-Black Tree**.
- A Red-Black Tree is a self-balancing Binary Search Tree.
- Keys are always stored in **sorted order**.
- Searching, insertion, deletion, and updates all take **O(log N)** time.
- Traversing a map visits elements in sorted order.
- Maps do not support index-based access because they are tree-based structures.
- `lower_bound()` and `upper_bound()` provide efficient logarithmic-time searches.
- Maps trade higher memory usage for ordered storage and guaranteed logarithmic performance.

---
