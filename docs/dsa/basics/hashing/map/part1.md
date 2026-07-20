# STL `map`

> Array hashing is extremely fast, but it has one major limitation:
>
> ```text
> It only works when the range of values is small and known.
> ```
>
> But what if the numbers are:
>
> ```text
> 5
> 100
> 999999999
> 1000000000000
> ```
>
> Creating an array of this size is impossible.
>
> This is where the STL `map` comes into the picture.

---

### What is a map?

A **map** is an STL container that stores data as:

```text
Key → Value
```

Each key is **unique** and is associated with exactly one value.

Example

```text
1 → 5

2 → 8

10 → 15
```

Think of it like a dictionary.

```text
Word

↓

Meaning
```

or

```text
Student ID

↓

Student Name
```

---

### Why Do We Need map?

Suppose we have

```cpp
arr = {1000000, 99999999, 5}
```

Using array hashing,

we would need

```cpp
int hash[100000000];
```

which wastes a huge amount of memory.

Instead,

```cpp
map<int,int>
```

stores only the elements that actually exist.

---

### Syntax

```cpp
map<KeyType, ValueType> variableName;
```

Example

```cpp
map<int, int> mp;
```

Meaning

```text
Key   → int

Value → int
```

---

### Visual Representation

```cpp
map<int,int> mp;
```

After inserting

```cpp
mp[5] = 10;

mp[2] = 7;

mp[9] = 15;
```

Map stores

```text
2 → 7

5 → 10

9 → 15
```

Notice

```text
Keys are automatically sorted.
```

---

### How to Insert Elements

#### Method 1

```cpp
mp[5] = 10;
```

---

#### Method 2

```cpp
mp.insert({5,10});
```

---

#### Method 3

```cpp
mp.emplace(5,10);
```

Recommended because it avoids unnecessary object creation.

---

### Updating Values

```cpp
mp[5] = 20;
```

Now

```text
5 → 20
```

The old value is replaced.

---

### Frequency Counting

One of the most common uses.

```cpp
map<int,int> freq;

freq[10]++;

freq[20]++;

freq[10]++;
```

Result

```text
10 → 2

20 → 1
```

---

### Accessing Elements

```cpp
cout << mp[5];
```

Output

```text
20
```

---

If key does not exist

```cpp
cout << mp[100];
```

Output

```text
0
```

because `operator[]` inserts the key with a default value.

---

### Checking if a Key Exists

Using

```cpp
find()
```

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

### Size

```cpp
cout << mp.size();
```

Returns

```text
Number of key-value pairs
```

---

### Empty

```cpp
mp.empty()
```

Returns

```text
true
```

if the map is empty.

---

### Removing Elements

Remove one key

```cpp
mp.erase(5);
```

---

Remove everything

```cpp
mp.clear();
```

---

### Traversing a map

Using range-based loop

```cpp
for(auto it : mp) {

    cout << it.first
         << " "
         << it.second
         << endl;
}
```

Output

```text
Key Value

2   7

5   20

9   15
```

---

Using iterator

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

### Why Can't We Access Using an Index?

Suppose

```cpp
map<int,int> mp;
```

Can we write

```cpp
mp[0]
```

to access the first element?

No.

---

Because

```text
Maps are NOT stored
like arrays.
```

A map stores elements based on their **keys**, not on numerical positions.

Valid

```cpp
mp[25]
```

means

```text
Value whose key is 25
```

It does **not** mean

```text
25th element
```

---

### Different Types of Maps

---

#### Integer Map

```cpp
map<int,int> mp;
```

---

#### Character Map

```cpp
map<char,int> mp;
```

Example

```cpp
mp['a']++;

mp['b']++;
```

---

#### String Map

```cpp
map<string,int> mp;
```

Example

```cpp
mp["apple"]++;

mp["banana"]++;
```

---

#### Pair as Key

```cpp
map<pair<int,int>,int> mp;
```

Example

```cpp
mp[{2,3}] = 10;
```

---

#### Vector as Key

```cpp
map<vector<int>,int> mp;
```

Although possible, it is used much less frequently.

---

### Can Keys Be Any Data Type?

Almost any data type can be used as a key **as long as it can be compared**.

Examples

```text
int

char

string

pair

vector

set

tuple
```

---

### Time Complexity

| Operation | Complexity |
| --------- | ---------: |
| Insert    |   O(log N) |
| Search    |   O(log N) |
| Update    |   O(log N) |
| Delete    |   O(log N) |
| Traverse  |       O(N) |
| Size      |       O(1) |
| Empty     |       O(1) |

where

```text
N = Number of elements in the map
```

---

### Space Complexity

```text
O(N)
```

because every inserted key-value pair occupies memory.

---

### When Should We Use map?

Use a `map` when:

- The range of keys is very large.
- Keys are unknown beforehand.
- You need the keys in **sorted order**.
- You need logarithmic-time insertion and searching.

---

### Advantages

- Automatically keeps keys sorted.
- Works for very large values.
- Supports many data types as keys.
- Efficient searching and insertion.
- No need to know the key range beforehand.

---

### Limitations

- Slower than array hashing.
- Slower than `unordered_map` (on average).
- Uses more memory than arrays.
- Does not support index-based access.

---

### Interview Questions

#### Q1. What is a map?

**Answer**

A `map` is an STL associative container that stores unique key-value pairs in sorted order.

---

#### Q2. Why do we use a map instead of array hashing?

**Answer**

Because array hashing requires a fixed and reasonably small range of values, while a map can efficiently handle very large or unknown key ranges.

---

#### Q3. Can duplicate keys exist in a map?

**Answer**

No. Every key is unique. Inserting an existing key updates its value.

---

#### Q4. Why can't we access a map using an index?

**Answer**

A map stores elements based on keys, not on contiguous memory positions like an array.

---

#### Q5. What are the time complexities of insertion and searching?

**Answer**

Both insertion and searching take **O(log N)** time.

---

### Key Takeaways

- `map` stores data as **key-value pairs**.
- Every key in a map is unique.
- Keys are automatically stored in **sorted order**.
- A map can handle very large or unknown key ranges.
- `operator[]` inserts a key with a default value if it does not already exist.
- Maps do not support index-based access.
- Insertion, deletion, update and search all take **O(log N)** time.
- `map` is preferred when sorted keys or ordered traversal are required.

---
