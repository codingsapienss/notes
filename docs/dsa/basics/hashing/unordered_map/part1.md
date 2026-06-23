# `unordered_map`

> In previous lessions, we learned about the STL `map`, which stores elements in **sorted order** using a **Red-Black Tree**.
>
> While `map` provides guaranteed **O(log N)** operations, there is an even faster container for most DSA problems:
>
> ```text
> unordered_map
> ```
>
> It provides **average O(1)** insertion, searching and deletion, making it the preferred choice for many competitive programming and interview problems.

---

## What is an unordered_map?

An `unordered_map` is an STL associative container that stores data as

```text
Key → Value
```

just like a `map`.

However, unlike `map`, it **does not maintain any ordering of keys**.

---

## map vs unordered_map

```text
map

↓

Sorted Order

↓

Red-Black Tree

↓

O(log N)
```

---

```text
unordered_map

↓

No Order

↓

Hash Table

↓

Average O(1)
```

---

## Syntax

```cpp
unordered_map<KeyType, ValueType> variableName;
```

Example

```cpp
unordered_map<int, int> mp;
```

Meaning

```text
Key   → int

Value → int
```

---

## Example

```cpp
unordered_map<int,int> mp;

mp[10] = 1;

mp[2] = 5;

mp[100] = 7;

mp[50] = 3;
```

Possible Output

```text
100 → 7

2 → 5

50 → 3

10 → 1
```

---

Notice

```text
The order is NOT sorted.
```

Every execution may even produce a different order.

---

## Why is it called "unordered"?

Unlike `map`, an `unordered_map` makes **no guarantee** about the order in which keys are stored or traversed.

Example

Inserted

```text
5

1

8

3
```

Possible Traversal

```text
8

1

5

3
```

or

```text
3

8

5

1
```

Both are valid.

---

## How to Insert Elements

Method 1

```cpp
mp[10] = 5;
```

---

Method 2

```cpp
mp.insert({10,5});
```

---

Method 3

```cpp
mp.emplace(10,5);
```

Recommended.

---

## Updating Values

```cpp
mp[10] = 20;
```

Result

```text
10 → 20
```

---

## Accessing Elements

```cpp
cout << mp[10];
```

Output

```text
20
```

---

If key doesn't exist

```cpp
cout << mp[100];
```

Output

```text
0
```

because `operator[]` inserts the key with a default value.

---

## Finding an Element

```cpp
if(mp.find(10) != mp.end()) {

    cout << "Found";
}
```

---

If not found

```cpp
mp.find(10) == mp.end()
```

---

## Removing Elements

```cpp
mp.erase(10);
```

---

Clear everything

```cpp
mp.clear();
```

---

## Size

```cpp
cout << mp.size();
```

Returns

```text
Number of key-value pairs
```

---

## Empty

```cpp
mp.empty();
```

Returns

```text
true

or

false
```

---

## Traversing

```cpp
for(auto x : mp) {

    cout << x.first
         << " "
         << x.second
         << endl;
}
```

Remember

```text
Traversal order is NOT guaranteed.
```

---

## Frequency Counting Example

Exactly like `map`.

```cpp
#include <iostream>
#include <unordered_map>
using namespace std;

int main() {

    int n;
    cin >> n;

    unordered_map<int,int> freq;

    for(int i = 0; i < n; i++) {

        int x;
        cin >> x;

        freq[x]++;
    }

    int q;
    cin >> q;

    while(q--) {

        int number;
        cin >> number;

        cout << freq[number]
             << endl;
    }
}
```

---

## Character Frequency

```cpp
string s;

cin >> s;

unordered_map<char,int> freq;

for(char ch : s) {

    freq[ch]++;
}
```

Query

```cpp
cout << freq['a'];
```

---

## Common Key Types

### Integer

```cpp
unordered_map<int,int> mp;
```

---

### Character

```cpp
unordered_map<char,int> mp;
```

---

### String

```cpp
unordered_map<string,int> mp;
```

---

### Long Long

```cpp
unordered_map<long long,int> mp;
```

---

## Can Any Data Type Be Used as a Key?

Only if a **hash function** exists for that type.

Built-in hash functions already exist for:

- `int`
- `long long`
- `char`
- `string`
- `bool`
- `double`
- many STL types

For custom classes or structures,

you must define your own hash function.

---

## Time Complexity

| Operation | Best | Average | Worst |
| --------- | ---- | ------- | ----- |
| Insert    | O(1) | O(1)    | O(N)  |
| Search    | O(1) | O(1)    | O(N)  |
| Update    | O(1) | O(1)    | O(N)  |
| Delete    | O(1) | O(1)    | O(N)  |
| Traverse  | O(N) | O(N)    | O(N)  |

---

## Why is the Worst Case O(N)?

Normally,

the hash function spreads keys across many buckets.

Example

```text
Bucket 0

↓

10

20
```

---

```text
Bucket 1

↓

35
```

---

```text
Bucket 2

↓

8

15
```

Searching is very fast.

---

But imagine every key goes into the same bucket.

```text
Bucket 0

↓

10

↓

20

↓

30

↓

40

↓

50
```

Now searching becomes

```text
Linear Search

↓

O(N)
```

This situation is called

```text
Collision
```

We'll study collisions in detail in Part 3C.

---

## Should We Always Use unordered_map?

Generally:

- If you **need sorted keys**, use `map`.
- If you **don't care about ordering** and want faster average performance, use `unordered_map`.

For most DSA problems,

```text
unordered_map
```

is usually the first choice.

---

## map vs unordered_map

| Feature            | map            | unordered_map |
| ------------------ | -------------- | ------------- |
| Internal Structure | Red-Black Tree | Hash Table    |
| Keys Sorted        | ✅             | ❌            |
| Insert             | O(log N)       | O(1) Average  |
| Search             | O(log N)       | O(1) Average  |
| Delete             | O(log N)       | O(1) Average  |
| Worst Case         | O(log N)       | O(N)          |
| Index Access       | ❌             | ❌            |

---

## Advantages

- Very fast average performance.
- Excellent for frequency counting.
- Supports large key ranges.
- Constant-time average lookup.
- Widely used in competitive programming.

---

## Limitations

- Keys are not sorted.
- Worst-case complexity is O(N).
- Slightly higher memory usage than `map`.
- No `lower_bound()` or `upper_bound()` because there is no ordering.

---

## Interview Questions

### Q1. What is an `unordered_map`?

**Answer**

An associative STL container that stores key-value pairs using a hash table and provides average O(1) insertion, searching, and deletion.

---

### Q2. Why is `unordered_map` faster than `map`?

**Answer**

Because it uses a **hash table** instead of a balanced tree, allowing average constant-time operations.

---

### Q3. Does `unordered_map` store keys in sorted order?

**Answer**

No. It does not guarantee any ordering of keys.

---

### Q4. Why can `unordered_map` become O(N)?

**Answer**

If many keys collide and end up in the same bucket, operations degrade to linear time.

---

### Q5. When should we use `unordered_map`?

**Answer**

When key ordering is not required and faster average performance is preferred.

---

## Key Takeaways

- `unordered_map` stores key-value pairs using a **hash table**.
- Keys are **not stored in sorted order**.
- Insertion, search, update and deletion take **O(1)** on average.
- Worst-case complexity is **O(N)** due to collisions.
- `unordered_map` is generally preferred over `map` for frequency counting and lookup problems when ordering is unnecessary.
- `unordered_map` cannot perform ordered operations like `lower_bound()` or `upper_bound()`.

---
