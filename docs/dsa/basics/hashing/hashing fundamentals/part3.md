# Character Hashing

> In previous lession, we learned how to perform hashing on **integers** using arrays.
>
> But what if the input contains characters instead of numbers?
>
> Example:
>
> ```text
> "abacbd"
> ```
>
> Questions like:
>
> - How many times does `'a'` occur?
> - How many times does `'b'` occur?
> - Is `'z'` present?
>
> can also be answered using hashing.
>
> This technique is called:
>
> ```text
> Character Hashing
> ```

---

### What is Character Hashing?

Character hashing is the process of storing the frequency of characters using a hash table.

Since every character has an **ASCII value**, we can use an array to store their frequencies.

---

### ASCII Values

Every character is internally represented as an integer.

Examples

| Character | ASCII Value |
| --------- | ----------: |
| A         |          65 |
| B         |          66 |
| C         |          67 |
| ...       |         ... |
| Z         |          90 |
| a         |          97 |
| b         |          98 |
| c         |          99 |
| ...       |         ... |
| z         |         122 |

---

Example

```cpp
char ch = 'A';

cout << (int)ch;
```

Output

```text
65
```

---

```cpp
char ch = 'a';

cout << (int)ch;
```

Output

```text
97
```

---

### Why Does Character Hashing Work?

Since every character is converted into its ASCII value,

we can directly use it as an array index.

Example

```cpp
char ch = 'A';

int hash[256];

hash[ch]++;
```

Internally,

this becomes

```cpp
hash[65]++;
```

---

### Important Point

Characters are **automatically converted to their ASCII integer values** whenever an integer is expected.

Example

```cpp
char ch = 'd';

cout << ch;
```

Output

```text
d
```

---

```cpp
cout << (int)ch;
```

Output

```text
100
```

---

Using it as an array index

```cpp
hash[ch]++;
```

becomes

```cpp
hash[100]++;
```

automatically.

This automatic conversion is known as:

```text
Implicit Type Conversion
```

---

### Character Frequency Example

String

```text
abacaba
```

Code

```cpp
#include <iostream>
using namespace std;

int main() {

    string s;
    cin >> s;

    int hash[256] = {0};

    for(char ch : s) {
        hash[ch]++;
    }

    cout << hash['a'] << endl;
    cout << hash['b'] << endl;
    cout << hash['c'] << endl;
}
```

Input

```text
abacaba
```

Output

```text
4
2
1
```

---

### Hash Table Visualization

String

```text
abacaba
```

Hash Table

```text
ASCII

97 ('a') → 4

98 ('b') → 2

99 ('c') → 1
```

---

### Lowercase Character Hashing (a-z)

Sometimes,

we only know that the string contains:

```text
a

↓

z
```

Instead of creating

```cpp
int hash[256];
```

we only need

```cpp
int hash[26];
```

---

### Mapping

Formula

```cpp
index = ch - 'a';
```

---

Example

```cpp
char ch = 'a';

cout << ch - 'a';
```

Output

```text
0
```

---

```cpp
char ch = 'b';

cout << ch - 'a';
```

Output

```text
1
```

---

```cpp
char ch = 'z';

cout << ch - 'a';
```

Output

```text
25
```

---

Visualization

```text
a → 0

b → 1

c → 2

...

z → 25
```

---

Code

```cpp
int hash[26] = {0};

for(char ch : s) {
    hash[ch - 'a']++;
}
```

---

Finding frequency

```cpp
cout << hash['c' - 'a'];
```

Output

```text
Frequency of c
```

---

### Uppercase Character Hashing (A-Z)

Formula

```cpp
index = ch - 'A';
```

Example

```cpp
'A' - 'A' = 0

'B' - 'A' = 1

'Z' - 'A' = 25
```

---

Code

```cpp
int hash[26] = {0};

for(char ch : s) {

    hash[ch - 'A']++;
}
```

---

### What if the String Contains Both Uppercase and Lowercase?

Example

```text
aAbBcC
```

Using

```cpp
ch - 'a'
```

is incorrect,

because

```text
'A'

ASCII = 65

'a'

ASCII = 97
```

Different ranges.

---

##### Solution 1 (Recommended)

Use

```cpp
int hash[256] = {0};
```

Example

```cpp
for(char ch : s) {

    hash[ch]++;
}
```

Works for

```text
A-Z

a-z

Digits

Symbols

Spaces
```

---

##### Solution 2

Create two arrays

```cpp
int lower[26];

int upper[26];
```

This is useful when uppercase and lowercase need to be counted separately.

---

### Why Do We Use an int Array Instead of a char Array?

Suppose

```text
aaaaaaa
```

Frequency

```text
7
```

If we store frequencies inside

```cpp
char hash[256];
```

then

each element stores a character,

not an integer count.

Instead,

we should use

```cpp
int hash[256];
```

because

```text
Frequency

↓

Integer
```

---

### Array Size

Most commonly,

```cpp
int hash[256];
```

is sufficient.

Why?

ASCII contains

```text
256 characters

0

↓

255
```

So every ASCII character has its own index.

---

### Time Complexity

Building frequency table

```text
O(N)
```

where

```text
N = Length of String
```

---

Each query

```text
O(1)
```

---

Overall

```text
O(N + Q)
```

---

### Space Complexity

Using ASCII

```cpp
int hash[256];
```

Space

```text
O(256)

≈ O(1)
```

because

256 is a constant.

---

### Advantages

- Extremely fast.
- Very easy to implement.
- Constant-time lookup.
- Perfect for ASCII characters.

---

### Limitations

Array hashing works only when

- Character set is small.
- Character range is known.

If characters are

```text
Unicode

UTF-8

UTF-16

UTF-32
```

or the range is very large,

using an array becomes inefficient.

In such cases,

use

```cpp
unordered_map<char, int>
```

or

```cpp
unordered_map<string, int>
```

depending on the problem.

---

### Character Hashing Using map

Instead of arrays,

we can also write

```cpp
map<char, int> freq;

for(char ch : s) {
    freq[ch]++;
}
```

Advantages

- Works without knowing the character range.
- Stores only characters that actually appear.
- Keys remain sorted.

Time Complexity

```text
O(log N)
```

per operation.

---

### Character Hashing Using unordered_map

```cpp
unordered_map<char, int> freq;

for(char ch : s) {
    freq[ch]++;
}
```

Advantages

- Average lookup is O(1).
- Handles arbitrary keys.
- Does not require a fixed array size.

---

### Array vs map vs unordered_map

| Feature                      | Array | map      | unordered_map |
| ---------------------------- | ----- | -------- | ------------- |
| Lookup                       | O(1)  | O(log N) | O(1) Average  |
| Ordered Keys                 | ❌    | ✅       | ❌            |
| Memory Usage                 | Fixed | Dynamic  | Dynamic       |
| Best for Small ASCII Range   | ✅    | ❌       | ❌            |
| Best for Unknown/Large Range | ❌    | ✅       | ✅            |

---

### Interview Questions

#### Q1. Why can characters be used as array indices?

**Answer**

Because every character has an ASCII integer value, and C++ automatically converts a character to its ASCII value when an integer is expected.

---

#### Q2. Why do we use `ch - 'a'`?

**Answer**

It maps lowercase letters from `'a'`–`'z'` to indices `0`–`25`, allowing us to use an array of size 26 instead of 256.

---

#### Q3. Why use `int hash[256]` instead of `char hash[256]`?

**Answer**

We store frequencies, which are integers. A `char` array is meant for storing character values, not occurrence counts.

---

#### Q4. When should we use array hashing for characters?

**Answer**

When the character set is small and known (for example, ASCII or only lowercase English letters).

---

#### Q5. When should we use `map` or `unordered_map` instead?

**Answer**

When the character range is unknown, very large, or when working with Unicode or other non-ASCII character sets.

---

### Key Takeaways

- Every character has a unique ASCII integer value.
- Characters are automatically converted to their ASCII values when used as array indices.
- `ch - 'a'` maps lowercase letters to indices `0–25`.
- `ch - 'A'` maps uppercase letters to indices `0–25`.
- Use `int hash[26]` when only lowercase or uppercase English letters are present.
- Use `int hash[256]` for general ASCII character hashing.
- Array hashing provides **O(1)** lookup and update time.
- `map<char, int>` and `unordered_map<char, int>` are better choices when the character range is large or unknown.

---
