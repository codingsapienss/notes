---
sidebar_label: 'Pointers Part 3C'
sidebar_position: 11
---

# Double Pointers Memory Layout

> This chapter covers one of the most confusing topics in C++:
>
> ```cpp
> const int* ptr;
> int* const ptr;
> const int* const ptr;
> ```
>
> Many developers memorize these declarations without understanding:
>
> - What is actually constant?
> - The pointer?
> - The value?
> - Both?
>
> Understanding const pointers is extremely important because:
>
> - They appear heavily in production code
> - They are used extensively in APIs
> - STL uses them internally
> - Modern C++ encourages const correctness
> - They are a favorite interview topic

---

### Learning Roadmap

In this chapter we will cover:

1. What is Const Correctness?
2. Why Const Exists
3. Pointer Refresher
4. Const Data vs Const Pointer
5. Pointer to Const
6. Const Pointer
7. Const Pointer to Const
8. Reading Complex Pointer Declarations
9. Memory Diagrams
10. Common Mistakes
11. Interview Questions

---

### Why Does Const Exist?

Consider:

```cpp
int value = 10;

value = 20;
```

Perfectly valid.

---

Sometimes we want:

```text
Value should not be modified.
```

---

Example:

```cpp
const int value = 10;
```

Now:

```cpp
value = 20;
```

Compilation Error.

---

### Why Is This Useful?

Prevents accidental modification.

---

Examples:

- Configuration values
- Constants
- API parameters
- Read-only data

---

### Pointer Refresher

Consider:

```cpp
int value = 10;

int* ptr = &value;
```

Memory:

```text
ptr
 │
 ▼

value
 10
```

---

Two things exist here:

```text
1. Pointer
2. Value
```

---

Question:

```text
What should become constant?

Pointer?
Value?
Both?
```

---

### Four Possible Cases

| Pointer  | Value    |
| -------- | -------- |
| Mutable  | Mutable  |
| Mutable  | Constant |
| Constant | Mutable  |
| Constant | Constant |

---

### Case 1: Normal Pointer

#### Mutable Pointer + Mutable Value

---

Declaration:

```cpp
int value = 10;

int* ptr = &value;
```

---

Allowed:

```cpp
*ptr = 50;
```

---

Allowed:

```cpp
ptr++;
```

---

Visual

```text
Pointer  -> Can Change

Value    -> Can Change
```

---

### Memory Diagram

```text
ptr
 │
 ▼

value
 10
```

Both are modifiable.

---

### Case 2: Pointer to Const

#### Mutable Pointer + Constant Value

---

Declaration

```cpp
const int* ptr;
```

or

```cpp
int const* ptr;
```

Both are identical.

---

### Read It As

```text
Pointer to Constant Integer
```

---

Example

```cpp
int value = 10;

const int* ptr = &value;
```

---

### What Is Restricted?

Value cannot be modified through pointer.

---

Illegal

```cpp
*ptr = 20;
```

Compilation Error.

---

### Why?

Compiler protects:

```text
Value through pointer
```

---

### What Is Allowed?

Pointer can move.

---

Valid

```cpp
ptr++;
```

---

Valid

```cpp
ptr = nullptr;
```

---

### Visual

```text
Pointer  -> Can Change

Value    -> Cannot Change Through Pointer
```

---

### Memory Diagram

```text
ptr
 │
 ▼

value
 10
```

Pointer moves.

Value protected.

---

### Important Interview Trap

Consider:

```cpp
int value = 10;

const int* ptr = &value;
```

---

Illegal:

```cpp
*ptr = 50;
```

---

But:

```cpp
value = 50;
```

is valid.

---

### Why?

Because:

```text
Object is not constant.
```

Only:

```text
Pointer view is constant.
```

---

### Example

```cpp
int value = 10;

const int* ptr = &value;

value = 50;

cout << *ptr;
```

Output:

```text
50
```

---

### Visual

```text
value

▲
│

ptr
```

Pointer cannot modify.

Variable itself can.

---

### Alternative Syntax

These are identical:

```cpp
const int* ptr;
```

---

```cpp
int const* ptr;
```

---

Compiler treats both same.

---

### Case 3: Const Pointer

#### Constant Pointer + Mutable Value

---

Declaration

```cpp
int* const ptr = &value;
```

---

### Read It As

```text
Constant Pointer
to Integer
```

---

Question:

What becomes constant?

Answer:

```text
Pointer itself.
```

---

### Example

```cpp
int value = 10;

int* const ptr = &value;
```

---

### What Is Allowed?

```cpp
*ptr = 50;
```

Valid.

---

Value changes.

---

### What Is NOT Allowed?

```cpp
ptr++;
```

Compilation Error.

---

```cpp
ptr = nullptr;
```

Compilation Error.

---

### Why?

Pointer address cannot change.

---

### Visual

```text
Pointer -> Fixed

Value -> Can Change
```

---

### Memory Diagram

```text
ptr
 │
 ▼

value
 10
```

Pointer locked.

Value editable.

---

### Example

```cpp
int value = 10;

int* const ptr = &value;

*ptr = 500;
```

Output:

```text
value = 500
```

---

### Example

```cpp
ptr = nullptr;
```

Compilation Error.

---

### Why?

Address stored inside pointer is constant.

---

### Case 4: Const Pointer To Const Data

#### Constant Pointer + Constant Value

---

Declaration

```cpp
const int* const ptr = &value;
```

---

### Read It As

```text
Constant Pointer
to Constant Integer
```

---

### Restrictions

Cannot modify value.

Cannot modify pointer.

---

### Example

```cpp
int value = 10;

const int* const ptr = &value;
```

---

Illegal

```cpp
*ptr = 50;
```

---

Illegal

```cpp
ptr++;
```

---

Illegal

```cpp
ptr = nullptr;
```

---

### Visual

```text
Pointer -> Fixed

Value -> Protected
```

---

### Memory Diagram

```text
ptr
 │
 ▼

value
 10
```

Nothing can change through pointer.

---

### Complete Comparison Table

| Declaration            | Value Change? | Pointer Change? |
| ---------------------- | ------------- | --------------- |
| `int* ptr`             | Yes           | Yes             |
| `const int* ptr`       | No            | Yes             |
| `int* const ptr`       | Yes           | No              |
| `const int* const ptr` | No            | No              |

---

### Easy Reading Rule

One of the most useful interview tricks.

---

### Rule

Start from variable name.

Then move:

```text
Right
↓

Left
```

---

### Example

```cpp
int* const ptr;
```

Start:

```text
ptr
```

Right:

```text
Nothing
```

Left:

```text
const
```

Meaning:

```text
Constant Pointer
```

---

Then:

```text
Pointer to int
```

Final:

```text
Constant Pointer to Integer
```

---

### Example

```cpp
const int* ptr;
```

Start:

```text
ptr
```

Left:

```text
*
```

Pointer.

---

Continue left:

```text
const int
```

Final:

```text
Pointer to Constant Integer
```

---

### Memory Comparison

---

#### Normal Pointer

```cpp
int* ptr;
```

```text
Pointer ✓
Value ✓
```

---

#### Pointer To Const

```cpp
const int* ptr;
```

```text
Pointer ✓
Value ✗
```

---

#### Const Pointer

```cpp
int* const ptr;
```

```text
Pointer ✗
Value ✓
```

---

#### Const Pointer To Const

```cpp
const int* const ptr;
```

```text
Pointer ✗
Value ✗
```

---

### Real-World Use Cases

---

#### Read-Only Function Parameters

Example:

```cpp
void print(const int* arr)
{
}
```

Guarantees:

```text
Array won't be modified.
```

---

#### API Design

Libraries use:

```cpp
const char*
```

frequently.

---

Example:

```cpp
strlen(const char* str);
```

---

Why?

Function should read.

Not modify.

---

### Common Bugs

---

#### Bug 1

Confusing:

```cpp
const int* ptr;
```

with

```cpp
int* const ptr;
```

---

They are completely different.

---

#### Bug 2

Thinking:

```cpp
const int* ptr
```

makes object constant.

Wrong.

Only pointer access is restricted.

---

#### Bug 3

Thinking:

```cpp
int* const ptr
```

makes value constant.

Wrong.

Only pointer becomes constant.

---

#### Bug 4

Memorizing declarations.

Instead of understanding:

```text
What is protected?
```

---

### Interview Questions

---

#### Q1

Difference between:

```cpp
const int* ptr;
```

and

```cpp
int* const ptr;
```

##### Answer

| Declaration      | Constant |
| ---------------- | -------- |
| `const int* ptr` | Data     |
| `int* const ptr` | Pointer  |

---

#### Q2

Can a pointer to const move?

##### Answer

Yes.

```cpp
ptr++;
```

valid.

---

#### Q3

Can a const pointer move?

##### Answer

No.

Address is fixed.

---

#### Q4

What does:

```cpp
const int* const ptr;
```

mean?

##### Answer

Both pointer and data are constant.

---

#### Q5

Which declaration is most restrictive?

##### Answer

```cpp
const int* const ptr;
```

---

### Cheat Sheet

```cpp
int* ptr;

const int* ptr;

int const* ptr;

int* const ptr;

const int* const ptr;

*ptr = 10;

ptr++;

ptr = nullptr;
```

---

### Quick Reference Table

| Declaration            | Data    | Pointer |
| ---------------------- | ------- | ------- |
| `int* ptr`             | Mutable | Mutable |
| `const int* ptr`       | Const   | Mutable |
| `int* const ptr`       | Mutable | Const   |
| `const int* const ptr` | Const   | Const   |

---

### Key Takeaways

- Const correctness protects data from accidental modification.
- A pointer and the value it points to are separate entities.
- `const int* ptr` protects data.
- `int* const ptr` protects pointer.
- `const int* const ptr` protects both.
- `const int*` and `int const*` are identical.
- Understanding what is constant is more important than memorizing syntax.
- Const correctness is heavily used in professional C++ codebases.
- Most pointer-related interview questions on const are variations of these four cases.

---
