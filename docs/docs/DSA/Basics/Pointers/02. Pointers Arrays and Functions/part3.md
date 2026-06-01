---
sidebar_label: 'Pointers Part 2C'
sidebar_position: 7
---
# Pointers in Functions, Array Decay, Array Parameters, and Passing Arrays to Functions

> This chapter explains one of the most important and frequently misunderstood topics in C++:
>
> ```cpp
> Functions + Arrays + Pointers
> ```
>
> Most developers know how to write:
>
> ```cpp
> int arr[5] = {1,2,3,4,5};
> ```
>
> but very few understand:
>
> - What actually gets passed to a function
> - Why arrays behave differently from normal variables
> - Why `sizeof(arr)` changes inside functions
> - Why modifying an array inside a function affects the original array
> - Why modifying a pointer parameter often does NOT affect the original pointer
> - What "Array Decay" means
>
> Understanding this chapter is critical before learning:
>
> - Dynamic Memory Allocation
> - STL Iterators
> - Double Pointers
> - C-style String Manipulation
> - Advanced Pointer Concepts

---

## Learning Roadmap

In this chapter we will cover:

1. Passing Variables to Functions
2. Passing Pointers to Functions
3. What Gets Copied?
4. Why Pointer Changes Sometimes Don't Reflect
5. Why Value Changes Reflect
6. Passing Arrays to Functions
7. Array Decay
8. Why `sizeof(arr)` Changes Inside Functions
9. Array Parameters Internally
10. Modifying Arrays Inside Functions
11. Passing Subarrays
12. Performance Benefits
13. Common Bugs
14. Interview Questions

---

## Revisiting Function Calls

Before understanding arrays, let's revisit normal variables.

---

## Example

```cpp
void update(int value)
{
    value = value + 10;
}

int main()
{
    int number = 5;

    update(number);

    cout << number;
}
```

Expected Output:

```text
5
```

---

## Why?

Because:

```cpp
update(number);
```

creates a copy.

---

## Memory

Before function call:

```text
number

Address: 1000
Value: 5
```

---

## During Function Call

```text
value

Address: 2000
Value: 5
```

---

## Visual

```text
number
 5

↓

COPY

value
 5
```

---

## Important Rule

Function parameters receive:

```text
Copies
```

unless references are used.

---

## Passing Pointers To Functions

Consider:

```cpp
void print(int *ptr)
{
    cout << ptr << endl;
    cout << *ptr << endl;
}
```

---

## Program

```cpp
int value = 5;

int *valuePtr = &value;

print(valuePtr);
```

---

## Memory Before Function Call

```text
value

Address: 1000
Value: 5


valuePtr

Address: 2000
Value: 1000
```

---

## What Gets Passed?

Many beginners think:

```text
The pointer itself
```

This is partially incorrect.

What actually gets passed is:

```text
A copy of the pointer
```

---

## Visual

Before Call

```text
valuePtr

Address: 2000
Value: 1000
```

---

## Function Parameter

```cpp
void print(int *ptr)
```

receives:

```text
ptr

Address: 3000
Value: 1000
```

---

## Important Observation

Two different pointer variables exist:

```text
valuePtr

and

ptr
```

---

But both store:

```text
Same address
```

---

## Memory Diagram

```text
valuePtr

↓

value
5

ptr

↓

value
5
```

---

## Why Does This Matter?

Because changes to:

```cpp
ptr
```

do NOT necessarily affect:

```cpp
valuePtr
```

---

## Example

```cpp
void update(int *ptr)
{
    ptr = ptr + 1;
}
```

---

## Program

```cpp
int value = 5;

int *valuePtr = &value;

update(valuePtr);

cout << valuePtr;
```

Expected Output:

```text
Original address unchanged
```

---

## Why?

Many developers expect:

```text
Pointer moved
```

Wrong.

---

## What Actually Happens?

Function receives:

```text
Copy of pointer
```

---

## Memory

Before:

```text
valuePtr

Value: 1000
```

---

Function:

```text
ptr

Value: 1000
```

---

Operation

```cpp
ptr = ptr + 1;
```

changes:

```text
ptr
```

only.

---

Result

```text
valuePtr still contains 1000
```

---

## Visual

Before:

```text
valuePtr ──► value
ptr      ──► value
```

---

After:

```text
valuePtr ──► value

ptr
   ↓
Different address
```

---

## Important Rule

Changing:

```cpp
ptr
```

changes:

```text
Local copy
```

only.

---

## Example From Your Code

```cpp
void update(int *ptr)
{
    ptr = ptr + 1;

    cout << ptr;
}
```

---

## Main Function

```cpp
int value = 5;

int *valuePtr = &value;

update(valuePtr);

cout << valuePtr;
```

Expected Output:

```text
Different addresses
```

Inside:

```text
ptr moved
```

Outside:

```text
valuePtr unchanged
```

---

## Why Does Updating Value Work?

Now consider:

```cpp
void updateValue(int *ptr)
{
    *ptr = *ptr + 10;
}
```

---

## Program

```cpp
int value = 5;

updateValue(&value);

cout << value;
```

Expected Output:

```text
15
```

---

## Why Different?

Because now:

```cpp
*ptr
```

is modified.

---

## Memory

Before:

```text
Address: 1000

Value: 5
```

---

## Function

```text
ptr = 1000
```

---

## Operation

```cpp
*ptr = *ptr + 10;
```

means:

```text
Go to address 1000

Modify value
```

---

## Memory After

```text
Address: 1000

Value: 15
```

---

## Key Insight

Changing:

```cpp
ptr
```

changes local pointer copy.

Changing:

```cpp
*ptr
```

changes original memory.

---

## Comparison Table

| Operation       | Original Variable Changes? |
| --------------- | -------------------------- |
| `ptr = ptr + 1` | No                         |
| `*ptr = 50`     | Yes                        |
| `(*ptr)++`      | Yes                        |
| `ptr++`         | No                         |

---

## Passing Arrays To Functions

Now we move to one of the most important concepts.

---

## Example

```cpp
int getSum(int arr[], int size)
{
    int sum = 0;

    for(int i=0;i<size;i++)
    {
        sum += arr[i];
    }

    return sum;
}
```

---

## Function Call

```cpp
int numbers[5] =
{
1,2,3,4,5
};

getSum(numbers,5);
```

---

## Beginner Assumption

Many developers think:

```text
Entire array copied
```

Wrong.

---

## What Actually Happens?

Only:

```text
Address of first element
```

is passed.

---

## Extremely Important Concept

This is called:

```text
Array Decay
```

---

## Array Decay

### Definition

When an array is passed to a function:

```text
Array automatically converts
to pointer to first element.
```

---

## Example

Function:

```cpp
int getSum(int arr[], int size)
```

Compiler internally treats it almost as:

```cpp
int getSum(int *arr, int size)
```

---

## These Are Equivalent

```cpp
void func(int arr[])
```

---

```cpp
void func(int *arr)
```

---

Both mean:

```text
Pointer to first element
```

---

## Memory Diagram

Original Array

```text
Address      Value

1000         1
1004         2
1008         3
1012         4
1016         5
```

---

Passed To Function

```text
arr

↓

1000
```

Only address passed.

---

## Why Is This Important?

Because:

```text
No full array copy occurs.
```

---

## Performance Benefit

Suppose:

```cpp
int arr[1000000];
```

Size:

```text
4 MB
```

---

## If Entire Array Were Copied

Every function call would copy:

```text
4 MB
```

Huge cost.

---

## Actual Behavior

Only:

```text
8-byte pointer
```

passed.

---

## Very Fast

```text
O(1)
```

parameter passing.

---

## sizeof Surprise

Consider:

```cpp
int numbers[10];

cout << sizeof(numbers);
```

Expected Output:

```text
40
```

because:

```text
10 × 4
```

---

## Now Inside Function

```cpp
void func(int arr[])
{
    cout << sizeof(arr);
}
```

---

## Output

Usually:

```text
8
```

on a 64-bit system.

---

## Why?

Because inside function:

```cpp
arr
```

is no longer an array.

It became:

```cpp
int*
```

---

## Visual

Before Function

```text
Array

40 bytes
```

---

Inside Function

```text
Pointer

8 bytes
```

---

## Example

```cpp
void func(int arr[])
{
    cout << sizeof(arr);
}

int main()
{
    int numbers[10];

    cout << sizeof(numbers) << endl;

    func(numbers);
}
```

Expected Output:

```text
40
8
```

---

## Common Interview Question

Why?

Answer:

```text
Array decays into pointer
when passed to a function.
```

---

## Modifying Array Inside Function

Consider:

```cpp
void update(int arr[])
{
    arr[0] = 999;
}
```

---

## Program

```cpp
int numbers[5] =
{
1,2,3,4,5
};

update(numbers);

cout << numbers[0];
```

Expected Output:

```text
999
```

---

## Why?

Because:

```text
Function received address
of original array.
```

---

## Memory

```text
numbers

↓

1 2 3 4 5
```

---

Function

```text
arr

↓

1 2 3 4 5
```

Same memory.

---

## Passing Part Of An Array

One of the biggest benefits of array decay.

---

## Example

```cpp
int numbers[6] =
{
45,
6,
7,
5,
54,
42
};
```

---

## Function Call

```cpp
getSum(numbers+3,3);
```

---

## What Does numbers+3 Mean?

Memory:

```text
Index      Value

0          45
1          6
2          7
3          5
4          54
5          42
```

---

## numbers+3

Points to:

```text
Index 3
```

---

## Visual

```text
45 6 7 5 54 42
       ↑
       |
numbers+3
```

---

## Function Receives

```text
5 54 42
```

---

## Sum

```text
5 + 54 + 42

=

101
```

---

## Expected Output

```text
101
```

---

## Why Is This Powerful?

Allows working with:

```text
Subarrays
```

without creating copies.

---

## Real World Example

Algorithms often process:

```text
Part of an array
```

instead of full array.

Examples:

- Merge Sort
- Quick Sort
- Binary Search
- Sliding Window
- Two Pointer Techniques

---

## Common Bugs

---

## Bug 1

```cpp
void func(int arr[])
{
    cout << sizeof(arr);
}
```

Expecting:

```text
Array size
```

Wrong.

Gets pointer size.

---

## Bug 2

```cpp
void update(int *ptr)
{
    ptr++;
}
```

Expecting original pointer to move.

Wrong.

Only local copy moves.

---

## Bug 3

Thinking:

```cpp
int arr[]
```

means full array passed.

Wrong.

Pointer passed.

---

## Bug 4

Forgetting array size parameter.

```cpp
void func(int arr[])
```

Array length is lost.

---

## Interview Questions

---

### Q1

What gets passed when an array is passed to a function?

#### Answer

Address of first element.

---

### Q2

What is Array Decay?

#### Answer

Automatic conversion of array into pointer to first element.

---

### Q3

Why does:

```cpp
sizeof(arr)
```

become 8 inside functions?

#### Answer

Because `arr` becomes an `int*`.

---

### Q4

Difference between:

```cpp
ptr++;
```

and

```cpp
(*ptr)++;
```

#### Answer

`ptr++` changes pointer.

`(*ptr)++` changes value.

---

### Q5

Why does modifying array inside function affect original array?

#### Answer

Function receives address of original array.

---

### Q6

Why is passing arrays efficient?

#### Answer

Only an address is passed, not the entire array.

---

## Cheat Sheet

```cpp
void func(int arr[]);

void func(int *arr);

sizeof(arr);

arr[0] = 999;

ptr++;

(*ptr)++;

getSum(arr+3,3);
```

---

## Key Takeaways

- Functions receive copies of parameters.
- Pointer parameters are also copied.
- Modifying pointer variable does not affect original pointer.
- Modifying dereferenced value affects original memory.
- Arrays decay into pointers when passed to functions.
- `int arr[]` and `int *arr` are equivalent function parameters.
- `sizeof(arr)` inside functions gives pointer size.
- Arrays are not copied during function calls.
- Passing arrays is efficient because only an address is passed.
- Subarrays can be passed using pointer arithmetic.
- Array decay is one of the most important C++ concepts.

---
