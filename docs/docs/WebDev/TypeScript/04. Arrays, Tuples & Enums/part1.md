# Arrays

> Arrays are one of the most commonly used data structures in TypeScript.
>
> They allow us to store:
>
> ```text
> Multiple values of the same type
> ```
>
> TypeScript enhances JavaScript arrays by adding:
>
> - Type Safety
> - Better IntelliSense
> - Compile-Time Validation
> - Safer Array Operations
>
> Arrays are heavily used in:
>
> - API Responses
> - Database Records
> - React State
> - Lists and Collections
> - Data Processing

---

# What is an Array?

An array is a collection of values stored in a single variable.

---

## JavaScript Example

```ts
const numbers = [10, 20, 30, 40];
```

---

Instead of:

```ts
const num1 = 10;
const num2 = 20;
const num3 = 30;
const num4 = 40;
```

we can store all values together.

---

# Why Do We Need Typed Arrays?

Consider JavaScript:

```ts
const values = [10, 20, 30];

values.push("hello");
```

Valid JavaScript.

---

Result:

```ts
[10, 20, 30, "hello"];
```

---

This may introduce bugs.

TypeScript prevents this.

---

# Array Type Syntax

There are two ways to define array types.

---

## Method 1 (Most Common)

```ts
type[]
```

---

Example

```ts
const numbers: number[] = [10, 20, 30];
```

---

Meaning:

```text
Array of Numbers
```

---

# Method 2 (Generic Syntax)

```ts
Array<type>;
```

---

Example

```ts
const numbers: Array<number> = [10, 20, 30];
```

---

Both are identical.

---

# Number Arrays

---

Example

```ts
const scores: number[] = [90, 95, 100];
```

---

Valid

```ts
scores.push(80);
```

---

Result

```ts
[90, 95, 100, 80];
```

---

Invalid

```ts
scores.push("hello");
```

Error:

```text
Argument of type 'string'
is not assignable to type 'number'
```

---

# String Arrays

---

Example

```ts
const users: string[] = ["Prashant", "John", "Alex"];
```

---

Valid

```ts
users.push("David");
```

---

Invalid

```ts
users.push(100);
```

Error.

---

# Boolean Arrays

---

Example

```ts
const flags: boolean[] = [true, false, true];
```

---

Valid

```ts
flags.push(false);
```

---

Invalid

```ts
flags.push("true");
```

---

# Type Inference with Arrays

TypeScript can infer array types automatically.

---

Example

```ts
const numbers = [10, 20, 30];
```

---

Inferred Type

```ts
number[]
```

---

Now:

```ts
numbers.push("hello");
```

Error.

---

# Mixed Arrays Using Union Types

Sometimes arrays need multiple types.

---

Example

```ts
const values: (string | number)[] = ["Prashant", 25, "John", 30];
```

---

Valid

```ts
values.push("Alex");
```

---

Valid

```ts
values.push(100);
```

---

Invalid

```ts
values.push(true);
```

---

# Important Interview Question

Difference between:

```ts
string | number[]
```

and

```ts
(string | number)[]
```

---

## First

```ts
string | number[]
```

Means:

```text
A string

OR

An array of numbers
```

---

Valid

```ts
"hello";
```

---

Valid

```ts
[1, 2, 3];
```

---

# Second

```ts
(string | number)[]
```

Means:

```text
Array containing
strings and numbers
```

---

Valid

```ts
["hello", 10];
```

---

# Accessing Array Elements

---

Example

```ts
const users = ["Prashant", "John"];
```

---

Access

```ts
console.log(users[0]);
```

Output

```text
Prashant
```

---

# TypeScript Knows Element Types

Example

```ts
const users: string[] = ["Prashant"];
```

---

```ts
users[0].toUpperCase();
```

Valid.

---

Why?

Because:

```text
users[0]
```

is known to be:

```ts
string;
```

---

# Array Length

---

Example

```ts
const numbers = [10, 20, 30];
```

---

```ts
console.log(numbers.length);
```

Output

```text
3
```

---

# Common Array Methods

---

## push()

Add at end.

```ts
const numbers = [10, 20];

numbers.push(30);
```

---

Result

```ts
[10, 20, 30];
```

---

## pop()

Remove last element.

```ts
numbers.pop();
```

---

Result

```ts
[10, 20];
```

---

## shift()

Remove first element.

```ts
numbers.shift();
```

---

## unshift()

Add at beginning.

```ts
numbers.unshift(5);
```

---

## includes()

Check existence.

```ts
numbers.includes(20);
```

Output

```text
true
```

---

## indexOf()

Find index.

```ts
numbers.indexOf(20);
```

Output

```text
1
```

---

# Iterating Arrays

---

## for Loop

```ts
const numbers = [10, 20, 30];

for (let i = 0; i < numbers.length; i++) {
  console.log(numbers[i]);
}
```

---

Output

```text
10
20
30
```

---

# for...of Loop

Modern approach.

---

```ts
for (const num of numbers) {
  console.log(num);
}
```

---

Output

```text
10
20
30
```

---

# forEach()

---

```ts
numbers.forEach((num) => {
  console.log(num);
});
```

---

Output

```text
10
20
30
```

---

# Arrays of Objects

Very common in real applications.

---

Example

```ts
type User = {
  id: number;
  name: string;
};
```

---

```ts
const users: User[] = [
  {
    id: 1,
    name: "Prashant",
  },
  {
    id: 2,
    name: "John",
  },
];
```

---

Access

```ts
console.log(users[0].name);
```

Output

```text
Prashant
```

---

# Nested Arrays

Arrays inside arrays.

---

Example

```ts
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
```

---

Access

```ts
matrix[1][2];
```

Output

```text
6
```

---

# Multidimensional Arrays

---

2D Array

```ts
number[][]
```

---

Example

```ts
const grid: number[][] = [
  [1, 2],
  [3, 4],
];
```

---

# Readonly Arrays

Sometimes arrays should not be modified.

---

Example

```ts
const numbers: readonly number[] = [10, 20, 30];
```

---

Attempt

```ts
numbers.push(40);
```

Error.

---

Attempt

```ts
numbers.pop();
```

Error.

---

# Alternative Readonly Syntax

```ts
ReadonlyArray<number>;
```

---

Equivalent to:

```ts
readonly number[]
```

---

Example

```ts
const users: ReadonlyArray<string> = ["Prashant", "John"];
```

---

# Real World Example

API Response

```ts
type User = {
  id: number;
  name: string;
};
```

---

```ts
const users: User[] = await fetchUsers();
```

---

TypeScript knows:

```text
users[0].name → string

users[0].id → number
```

---

Strong typing throughout the application.

---

# Common Mistakes

---

## Mixing Types Accidentally

Wrong

```ts
const scores: number[] = [90, 95];

scores.push("100");
```

Error.

---

## Confusing Array Types

Wrong

```ts
string | number[]
```

when you intended:

```ts
(string | number)[]
```

---

## Forgetting Readonly Arrays

If data should never change:

```ts
readonly number[]
```

is often safer.

---

# Interview Questions

---

## Q1

How do you define an array of numbers?

### Answer

```ts
number[]
```

---

## Q2

Alternative syntax for arrays?

### Answer

```ts
Array<number>;
```

---

## Q3

Difference between:

```ts
string | number[]
```

and

```ts
(string | number)[]
```

### Answer

```ts
string | number[]
```

↓

```text
string OR number array
```

---

```ts
(string | number)[]
```

↓

```text
array containing strings and numbers
```

---

## Q4

How do you create a readonly array?

### Answer

```ts
readonly number[]
```

or

```ts
ReadonlyArray<number>;
```

---

## Q5

How do you type an array of objects?

### Answer

```ts
User[]
```

---

# Cheat Sheet

```ts
const nums: number[] = [1, 2, 3];
```

---

```ts
const nums: Array<number> = [1, 2, 3];
```

---

```ts
const values: (string | number)[] = ["hello", 10];
```

---

```ts
const users: User[] = [];
```

---

```ts
const matrix: number[][] = [
  [1, 2],
  [3, 4],
];
```

---

```ts
const nums: readonly number[] = [1, 2, 3];
```

---

# Key Takeaways

- Arrays store multiple values of the same type.
- TypeScript adds compile-time type safety to arrays.
- Arrays can be typed using `type[]` or `Array<type>`.
- Type inference automatically determines array types.
- Union types can be used inside arrays.
- Arrays can contain objects and nested arrays.
- TypeScript understands element types when accessing array values.
- Readonly arrays prevent accidental modifications.
- Arrays are heavily used in APIs, React applications and backend systems.
- Strongly typed arrays improve maintainability and reduce runtime bugs.

---
 


---\n*Last refined on April 14, 2026*


---\n*Last refined on April 27, 2026*
