# Array Hashing

> In previous lesson, we learned the basic idea of hashing.
>
> Now let's learn the simplest implementation of hashing:
>
> ```text
> Array Hashing
> ```
>
> Array hashing is the fastest hashing technique when the range of values is small and known in advance.

---

# What is Array Hashing?

Array Hashing uses an **array as a hash table**.

Instead of storing elements,

we store their **frequency** at the index corresponding to the element.

For example,

```cpp
arr = {1, 2, 1, 3, 2, 1}
```

We create another array:

```cpp
int hash[4] = {0};
```

Then,

```cpp
hash[1]++;
hash[2]++;
hash[1]++;
hash[3]++;
hash[2]++;
hash[1]++;
```

Final array

```text
Index      0 1 2 3

Value      0 3 2 1
```

Meaning

```text
1 occurs 3 times

2 occurs 2 times

3 occurs 1 time
```

---

# Why Does This Work?

The number itself becomes the array index.

```text
Element

↓

Array Index

↓

Frequency Stored
```

Example

```text
5

↓

hash[5]

↓

Frequency of 5
```

---

# Example

Array

```cpp
int arr[] = {4, 7, 4, 2, 7, 4};
```

Hash array

```cpp
int hash[8] = {0};
```

Building hash

```cpp
for(int i = 0; i < 6; i++) {
    hash[arr[i]]++;
}
```

Contents

```text
Index : 0 1 2 3 4 5 6 7

Value : 0 0 1 0 3 0 0 2
```

Now

```cpp
cout << hash[4];
```

Output

```text
3
```

---

# Complete Example

```cpp
#include <iostream>
using namespace std;

int main() {

    int n;
    cin >> n;

    int arr[n];

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    int hash[100001] = {0};

    for(int i = 0; i < n; i++) {
        hash[arr[i]]++;
    }

    int q;
    cin >> q;

    while(q--) {

        int number;
        cin >> number;

        cout << hash[number] << endl;
    }
}
```

---

# Time Complexity

Building hash table

```text
O(N)
```

---

Each query

```text
O(1)
```

---

Total

```text
O(N + Q)
```

where

```text
N = number of elements

Q = number of queries
```

---

# Space Complexity

If maximum value is

```text
M
```

then

```text
Space = O(M)
```

---

# When Can We Use Array Hashing?

Array hashing is useful only when

- Values are non-negative.
- Maximum value is known.
- Maximum value is reasonably small.

Example

```text
Values

0

↓

100000
```

Perfect for array hashing.

---

Not suitable

```text
Values

1

↓

10^12
```

Creating an array of size

```text
10^12
```

is impossible.

---

# Local Arrays vs Global Arrays

One of the most common interview questions.

---

## Local Array

Declared inside

```cpp
main()
```

or any function.

Example

```cpp
int main() {

    int arr[100];

}
```

---

Stored in

```text
Stack Memory
```

---

## Global Array

Declared outside every function.

Example

```cpp
int arr[100];

int main() {

}
```

---

Stored in

```text
Global/Data Segment
```

---

# Initialization Difference

## Local Array

```cpp
int arr[5];
```

Contents

```text
Garbage Values
```

Example

```text
8347

-2893

92812

...
```

because local arrays are **not initialized automatically**.

---

## Global Array

```cpp
int arr[5];
```

(outside main)

Contents

```text
0 0 0 0 0
```

because global variables are automatically initialized to zero.

---

# Why?

Global variables are initialized by the operating system before `main()` starts.

Local variables are allocated when the function is called and are **left uninitialized** unless you initialize them yourself.

---

# Maximum Array Size

Another very common interview topic.

---

## Inside main()

Arrays are stored in

```text
Stack Memory
```

Stack size is limited.

Typically

```text
Around

10^6 integers

(≈ 4 MB)

sometimes

up to

10^7
```

depending on the compiler, operating system, and stack limit.

Trying to allocate a much larger array often results in:

```text
Stack Overflow

or

Segmentation Fault
```

---

Example

```cpp
int main() {

    int arr[100000000];
}
```

May crash immediately.

---

# Global Arrays

Global arrays are **not stored on the stack**.

They are stored in the program's data segment.

Therefore,

much larger arrays are possible.

Example

```cpp
int arr[10000000];
```

is commonly accepted in competitive programming.

---

# Why Does a Segmentation Fault Occur?

Suppose

```cpp
int arr[100000000];
```

Inside

```cpp
main()
```

Required memory

```text
100000000 × 4

=

400 MB
```

The stack cannot provide this much memory.

Result

```text
Segmentation Fault
```

---

# Approximate Safe Limits

| Data Type   |               Local Array (Stack) |            Global Array |
| ----------- | --------------------------------: | ----------------------: |
| `int`       |                              ~10⁶ |                    ~10⁷ |
| `char`      |                              ~10⁶ |                    ~10⁷ |
| `bool`      |                              ~10⁶ |                    ~10⁷ |
| `long long` | Smaller than `int` (8 bytes each) | Depends on memory limit |

> **Note:** These are common competitive programming guidelines, **not fixed C++ language limits**. The actual limit depends on the available stack size and the memory limit imposed by the operating system or online judge.

---

# Advantages of Array Hashing

- Extremely simple
- Very fast
- Constant-time lookup
- Easy to implement

---

# Limitations

Cannot be used when

- Values are very large.
- Values are negative.
- Range is unknown.
- Memory required becomes too large.

Example

```text
10

100

500000000

999999999
```

An array would waste enormous amounts of memory.

In such cases,

we use

```text
map

or

unordered_map
```

which will be covered in the next parts.

---

# Interview Questions

## Q1. Why is array hashing so fast?

**Answer**

Because array indexing is a direct memory access operation, giving **O(1)** lookup time.

---

## Q2. Why are global arrays initialized to zero?

**Answer**

Global variables are automatically initialized by the runtime before the program starts.

---

## Q3. Why do local arrays contain garbage values?

**Answer**

Local variables are not initialized automatically and contain whatever data already exists in the allocated memory.

---

## Q4. Why do very large arrays inside `main()` cause a segmentation fault?

**Answer**

Because local arrays are allocated on the stack, which has limited memory. Exceeding that limit causes a stack overflow, often reported as a segmentation fault.

---

## Q5. When should array hashing be used?

**Answer**

When the range of possible values is small, known beforehand, and memory usage remains reasonable.

---

# Key Takeaways

- Array hashing uses an array as a hash table.
- The element itself acts as the array index.
- Frequency counting can be done in **O(N)** preprocessing.
- Each lookup takes **O(1)** time.
- Local arrays are stored on the **stack** and contain garbage values unless initialized.
- Global arrays are stored in the **data segment** and are automatically initialized to zero.
- Very large local arrays may cause a **stack overflow** and lead to a segmentation fault.
- Array hashing is efficient only for **small, bounded ranges** of values.
- For large or unknown ranges, `map` and `unordered_map` are better choices.

---
