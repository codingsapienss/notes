---
sidebar_label: 'Loops'
sidebar_position: 6
---

# Loops

> Loops allow us to execute a block of code multiple times without writing the same code repeatedly.
>
> They are one of the most important concepts in programming and are heavily used in:
>
> - Arrays
> - Strings
> - Data Structures
> - Algorithms
> - Competitive Programming
> - Real-world Applications

---

## Why Do We Need Loops?

Without loops:

```cpp
cout << 1 << endl;
cout << 2 << endl;
cout << 3 << endl;
cout << 4 << endl;
cout << 5 << endl;
```

This becomes impractical for large repetitions.

---

Using loops:

```cpp
for(int i = 1; i <= 5; i++)
{
    cout << i << endl;
}
```

Output:

```text
1
2
3
4
5
```

---

## What is a Loop?

A loop repeatedly executes a block of code until a condition becomes false.

---

### General Flow

```text
Initialize
    ↓
Check Condition
    ↓
 True
    ↓
Execute Code
    ↓
Update
    ↓
Check Again
```

---

## Types of Loops in C++

```text
Loops
│
├── for Loop
├── while Loop
└── do-while Loop
```

---

## for Loop

Used when the number of iterations is known.

---

### Syntax

```cpp
for(initialization; condition; update)
{
    // code
}
```

---

### Example

```cpp
for(int i = 1; i <= 5; i++)
{
    cout << i << " ";
}
```

#### Output

```text
1 2 3 4 5
```

---

## Understanding the Flow

```cpp
for(int i = 1; i <= 3; i++)
{
    cout << i << " ";
}
```

---

#### Iteration 1

```text
i = 1

1 <= 3 ✓

Print 1

i++
```

---

#### Iteration 2

```text
i = 2

2 <= 3 ✓

Print 2

i++
```

---

#### Iteration 3

```text
i = 3

3 <= 3 ✓

Print 3

i++
```

---

#### Iteration 4

```text
i = 4

4 <= 3 ✗

Stop
```

---

## Loop Variable

The variable controlling a loop is called:

```text
Loop Control Variable
```

Example:

```cpp
for(int i = 0; i < 10; i++)
```

Here:

```cpp
i
```

is the loop variable.

---

## Reverse Loop

```cpp
for(int i = 5; i >= 1; i--)
{
    cout << i << " ";
}
```

#### Output

```text
5 4 3 2 1
```

---

## while Loop

Used when the number of iterations is unknown.

---

### Syntax

```cpp
while(condition)
{
    // code
}
```

---

### Example

```cpp
int i = 1;

while(i <= 5)
{
    cout << i << " ";

    i++;
}
```

#### Output

```text
1 2 3 4 5
```

---

## Flow of while Loop

```text
Condition
    ↓
 True
    ↓
Execute Code
    ↓
Update
    ↓
Condition Again
```

---

## Example

```cpp
int count = 5;

while(count > 0)
{
    cout << count << " ";

    count--;
}
```

#### Output

```text
5 4 3 2 1
```

---

## do-while Loop

Unlike `for` and `while`, a `do-while` loop executes at least once.

---

### Syntax

```cpp
do
{
    // code
}
while(condition);
```

---

### Example

```cpp
int i = 1;

do
{
    cout << i << " ";

    i++;
}
while(i <= 5);
```

#### Output

```text
1 2 3 4 5
```

---

## Important Difference

```cpp
int i = 10;

while(i < 5)
{
    cout << "Hello";
}
```

Output:

```text
No Output
```

---

But:

```cpp
int i = 10;

do
{
    cout << "Hello";
}
while(i < 5);
```

Output:

```text
Hello
```

---

Reason:

```text
do-while executes first,
checks later.
```

---

## for vs while vs do-while

| Feature                 | for         | while       | do-while  |
| ----------------------- | ----------- | ----------- | --------- |
| Condition Checked First | Yes         | Yes         | No        |
| Executes At Least Once  | No          | No          | Yes       |
| Known Iterations        | Best Choice | Possible    | Possible  |
| Unknown Iterations      | Less Common | Best Choice | Sometimes |

---

## Infinite Loops

A loop that never terminates.

---

### Infinite for Loop

```cpp
for(;;)
{
    cout << "Hello";
}
```

---

### Infinite while Loop

```cpp
while(true)
{
    cout << "Hello";
}
```

---

## Why Infinite Loops Occur?

Condition never becomes false.

---

Example

```cpp
int i = 1;

while(i <= 5)
{
    cout << i;
}
```

---

Problem:

```cpp
i++
```

missing.

---

Result:

```text
Infinite Loop
```

---

## break Statement

Used to immediately terminate a loop.

---

### Example

```cpp
for(int i = 1; i <= 10; i++)
{
    if(i == 5)
    {
        break;
    }

    cout << i << " ";
}
```

#### Output

```text
1 2 3 4
```

---

### Flow

```text
Loop Running
      ↓
Condition Met
      ↓
break
      ↓
Loop Ends
```

---

## continue Statement

Skips the current iteration.

---

### Example

```cpp
for(int i = 1; i <= 5; i++)
{
    if(i == 3)
    {
        continue;
    }

    cout << i << " ";
}
```

#### Output

```text
1 2 4 5
```

---

## Nested Loops

A loop inside another loop.

---

### Example

```cpp
for(int i = 1; i <= 3; i++)
{
    for(int j = 1; j <= 3; j++)
    {
        cout << "* ";
    }

    cout << endl;
}
```

#### Output

```text
* * *
* * *
* * *
```

---

## Understanding Nested Loops

Outer Loop:

```cpp
i
```

controls rows.

---

Inner Loop:

```cpp
j
```

controls columns.

---

## Common Uses of Nested Loops

- Patterns
- Matrices
- 2D Arrays
- Grids

---

## Common Beginner Mistakes

---

### Missing Update

Wrong

```cpp
int i = 1;

while(i <= 5)
{
    cout << i;
}
```

Infinite loop.

---

### Semicolon After Loop

Wrong

```cpp
for(int i=1;i<=5;i++);
{
    cout << i;
}
```

---

The semicolon ends the loop immediately.

---

### Using Wrong Condition

Wrong

```cpp
for(int i=1;i>=5;i++)
```

Loop never executes.

---

## Interview Questions

### Q1. Difference between while and do-while?

#### Answer

`while` checks condition first.

`do-while` executes once before checking.

---

### Q2. Which loop is best when iteration count is known?

#### Answer

```cpp
for
```

---

### Q3. What causes an infinite loop?

#### Answer

Condition never becomes false.

---

### Q4. What does break do?

#### Answer

Terminates the loop immediately.

---

### Q5. What does continue do?

#### Answer

Skips the current iteration and moves to the next one.

---

### Q6. What are nested loops?

#### Answer

Loops placed inside another loop.

---

## Cheat Sheet

```cpp
for(int i=0;i<5;i++)
{
}
```

```cpp
while(condition)
{
}
```

```cpp
do
{
}
while(condition);
```

```cpp
break;
```

```cpp
continue;
```

```cpp
for(;;)
{
}
```

```cpp
while(true)
{
}
```

---

## Key Takeaways

- Loops are used to execute code repeatedly.
- C++ provides `for`, `while`, and `do-while` loops.
- `for` is best when iteration count is known.
- `while` is useful when iteration count is unknown.
- `do-while` always executes at least once.
- Infinite loops occur when conditions never become false.
- `break` exits a loop immediately.
- `continue` skips the current iteration.
- Nested loops are commonly used for patterns, matrices, and 2D arrays.
- Loops are fundamental for arrays, strings, and data structures.

---