# Frequency Counting using `map`

> The most common application of a `map` in DSA is:
>
> ```text
> Frequency Counting
> ```
>
> Frequency counting is used in hundreds of coding interview questions, including:
>
> - Count Frequencies
> - Majority Element
> - Single Number
> - Most Frequent Element
> - Character Frequency
> - Word Frequency
> - Query Problems

---

# What is Frequency Counting?

Frequency Counting means:

```text
Count

↓

How many times

↓

Each element appears
```

Example

```text
Array

1 2 1 3 2 1
```

Frequency Table

```text
1 → 3

2 → 2

3 → 1
```

---

# Why use map?

Suppose the array contains

```text
10

500

100000000

999999999
```

Array hashing is not practical.

Instead

```cpp
map<int,int>
```

stores only the numbers that actually appear.

---

# Frequency Counting (Integer)

Example

```cpp
#include <iostream>
#include <map>
using namespace std;

int main() {

    int n;
    cin >> n;

    int arr[n];

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    map<int,int> freq;

    for(int i = 0; i < n; i++) {
        freq[arr[i]]++;
    }

    for(auto x : freq) {

        cout << x.first
             << " -> "
             << x.second
             << endl;
    }
}
```

---

## Input

```text
6

1 2 1 3 2 1
```

---

## Output

```text
1 -> 3

2 -> 2

3 -> 1
```

---

# Understanding

Initially

```text
Map

{}
```

---

Read

```text
1
```

Map

```text
1 → 1
```

---

Read

```text
2
```

Map

```text
1 → 1

2 → 1
```

---

Read

```text
1
```

Map

```text
1 → 2

2 → 1
```

---

Read

```text
3
```

Map

```text
1 → 2

2 → 1

3 → 1
```

---

Read

```text
2
```

Map

```text
1 → 2

2 → 2

3 → 1
```

---

Read

```text
1
```

Final Map

```text
1 → 3

2 → 2

3 → 1
```

---

# Why Does

```cpp
freq[arr[i]]++;
```

Work?

Suppose

```cpp
arr[i] = 5;
```

Then

```cpp
freq[5]++;
```

If

```text
5
```

does not exist,

`map` automatically creates

```text
5 → 0
```

Then

```cpp
++
```

makes it

```text
5 → 1
```

This automatic insertion is one of the most useful features of `map`.

---

# Query Problem

One of the most common interview patterns.

---

## Problem

Given an array,

answer multiple frequency queries.

---

Example

```text
Array

1 2 1 3 2 1
```

Queries

```text
1

2

5
```

Output

```text
3

2

0
```

---

# Solution

```cpp
#include <iostream>
#include <map>
using namespace std;

int main() {

    int n;
    cin >> n;

    int arr[n];

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    map<int,int> freq;

    for(int i = 0; i < n; i++) {
        freq[arr[i]]++;
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

# Time Complexity

Building map

```text
N insertions

↓

O(N log N)
```

---

Each query

```text
Search

↓

O(log N)
```

---

Overall

```text
O(N log N + Q log N)
```

---

# Character Frequency

Exactly the same idea.

Instead of integers,

the key becomes a character.

---

Example

```cpp
string s;

cin >> s;

map<char,int> freq;

for(char ch : s) {

    freq[ch]++;
}
```

---

Input

```text
abacaba
```

Map

```text
a → 4

b → 2

c → 1
```

---

Query

```cpp
cout << freq['a'];
```

Output

```text
4
```

---

# Word Frequency

`map` can also count words.

Example

```cpp
map<string,int> freq;

freq["apple"]++;

freq["banana"]++;

freq["apple"]++;
```

Result

```text
apple → 2

banana → 1
```

---

# Traversing the Map

```cpp
for(auto x : freq) {

    cout << x.first
         << " "
         << x.second
         << endl;
}
```

Output

```text
Key Frequency
```

---

# Checking Frequency

Suppose

```cpp
cout << freq[100];
```

If

```text
100
```

does not exist,

Output

```text
0
```

because `operator[]` creates

```text
100 → 0
```

---

If you only want to check whether a key exists **without inserting it**, use:

```cpp
if(freq.find(100) != freq.end()) {

    cout << "Found";
}
```

---

# Real DSA Applications

Frequency counting using `map` is used in:

- Majority Element
- Single Number
- Most Frequent Character
- Count Distinct Elements
- Two Sum
- Group Anagrams
- Top K Frequent Elements
- First Non-Repeating Character
- Count Pairs
- Sliding Window Problems

---

# map vs Array Hashing

| Feature        | Array | map      |
| -------------- | ----- | -------- |
| Key Range      | Small | Any Size |
| Ordered Keys   | ❌    | ✅       |
| Lookup         | O(1)  | O(log N) |
| Memory         | Fixed | Dynamic  |
| Unknown Values | ❌    | ✅       |

---

# Common Mistakes

---

## Using Array Hashing for Huge Values

Wrong

```cpp
int hash[1000000000];
```

---

Use

```cpp
map<int,int>
```

---

## Forgetting That `operator[]` Inserts Keys

```cpp
cout << freq[100];
```

If `100` is absent,

it gets inserted with value

```text
0
```

If you don't want insertion,

use

```cpp
find()
```

---

## Confusing Key with Frequency

Wrong

```text
Map Index
```

Correct

```text
Key → Frequency
```

The key can be:

- int
- char
- string
- pair
- vector (with `map`)

---

# Interview Questions

## Q1. Why is `map` commonly used for frequency counting?

**Answer**

Because it efficiently stores frequencies for any key range without requiring a large fixed-size array.

---

## Q2. What happens if we write `freq[x]++` and `x` is not present?

**Answer**

`map` automatically inserts `x` with value `0`, then increments it to `1`.

---

## Q3. How do you count character frequencies using `map`?

**Answer**

```cpp
map<char,int> freq;

for(char ch : s)
    freq[ch]++;
```

---

## Q4. What is the time complexity of building a frequency map?

**Answer**

Each insertion is **O(log N)**, so building the map takes **O(N log N)**.

---

## Q5. When should you use `map` instead of array hashing?

**Answer**

When the range of values is large, unknown, or sparse, making array hashing inefficient.

---

# Key Takeaways

- `map` is one of the most common tools for frequency counting.
- It stores frequencies as **Key → Count** pairs.
- `freq[key]++` automatically creates missing keys with a default value of `0`.
- The same approach works for integers, characters, strings, and many other key types.
- Frequency maps are widely used in DSA interview problems.
- Building a frequency map takes **O(N log N)** time.
- Each lookup, insertion, update, and deletion takes **O(log N)** time.
- `map` is preferred over array hashing when the key range is large or unknown.

---
