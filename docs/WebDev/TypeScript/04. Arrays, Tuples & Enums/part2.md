# Tuples

> Arrays are useful when all elements have the same type.
>
> Example:
>
> ```ts
> const numbers: number[] = [10, 20, 30];
> ```
>
> Every element is:
>
> ```ts
> number;
> ```
>
> But sometimes we need:
>
> ```text
> Fixed Number of Elements
> Fixed Order
> Different Types at Different Positions
> ```
>
> This is where:
>
> ```text
> Tuples
> ```
>
> become useful.
>
> Tuples are one of the most frequently asked TypeScript interview topics.

---

### What is a Tuple?

A Tuple is a special type of array where:

```text
Length is Fixed
Order is Fixed
Types are Fixed
```

---

#### Example

```ts
const user: [string, number] = ["Prashant", 25];
```

---

Meaning:

```text
Index 0 → string

Index 1 → number
```

---

### Why Not Use a Normal Array?

Consider:

```ts
const user: (string | number)[] = ["Prashant", 25];
```

---

TypeScript only knows:

```text
Array contains strings and numbers
```

---

It does NOT know:

```text
Position 0 → string

Position 1 → number
```

---

A Tuple provides this guarantee.

---

### Tuple Syntax

---

#### Basic Syntax

```ts
[type1, type2];
```

---

Example

```ts
const user: [string, number] = ["Prashant", 25];
```

---

### Valid Tuple

```ts
const user: [string, number] = ["Prashant", 25];
```

---

Explanation

```text
Index 0 → string

Index 1 → number
```

Matches perfectly.

---

### Invalid Tuple

Wrong Order

```ts
const user: [string, number] = [25, "Prashant"];
```

Error.

---

Because:

```text
Index 0 expected string

Received number
```

---

### Another Invalid Example

Missing Element

```ts
const user: [string, number] = ["Prashant"];
```

Error.

---

Because:

```text
Tuple expects 2 elements.
```

---

### Fixed Length Guarantee

Example

```ts
const point: [number, number] = [10, 20];
```

---

Valid.

---

Attempt

```ts
const point: [number, number] = [10, 20, 30];
```

Error.

---

Why?

Because:

```text
Tuple length is fixed.
```

---

### Accessing Tuple Values

---

Example

```ts
const user: [string, number] = ["Prashant", 25];
```

---

Access

```ts
console.log(user[0]);
```

Output

```text
Prashant
```

---

Access

```ts
console.log(user[1]);
```

Output

```text
25
```

---

### TypeScript Knows Exact Types

---

Example

```ts
const user: [string, number] = ["Prashant", 25];
```

---

TypeScript knows:

```ts
user[0];
```

is:

```ts
string;
```

---

Therefore:

```ts
user[0].toUpperCase();
```

Valid.

---

TypeScript also knows:

```ts
user[1];
```

is:

```ts
number;
```

---

Therefore:

```ts
user[1].toFixed(2);
```

Valid.

---

### Real World Example

Coordinates

---

Example

```ts
const location: [number, number] = [28.6139, 77.209];
```

---

Meaning

```text
Latitude
Longitude
```

---

Without Tuple

```ts
number[]
```

TypeScript cannot guarantee:

```text
Exactly two values.
```

---

### Another Real World Example

API Result

---

```ts
const response: [boolean, string] = [true, "Success"];
```

---

Meaning

```text
Index 0 → Status

Index 1 → Message
```

---

### Tuple with More Elements

---

Example

```ts
const employee: [number, string, boolean] = [101, "Prashant", true];
```

---

Meaning

```text
ID
Name
Active Status
```

---

### Readonly Tuples

Sometimes tuple values should never change.

---

Example

```ts
const point: readonly [number, number] = [10, 20];
```

---

Attempt

```ts
point[0] = 50;
```

Error.

---

Readonly protects tuple values.

---

### Alternative Readonly Syntax

---

Using Utility Type

```ts
Readonly<[number, number]>;
```

---

Example

```ts
const point: Readonly<[number, number]> = [10, 20];
```

---

Equivalent to:

```ts
readonly[(number, number)];
```

---

### Optional Tuple Elements

Sometimes some positions are optional.

---

#### Syntax

```ts
[
  type1,
  type2?
]
```

---

Example

```ts
const user: [string, number?] = ["Prashant"];
```

---

Valid.

---

Also Valid

```ts
["Prashant", 25];
```

---

### Why Use Optional Tuple Elements?

Example:

```text
Name required

Age optional
```

---

Tuple

```ts
[
  string,
  number?
]
```

models this perfectly.

---

### Rest Elements in Tuples

A tuple can contain:

```text
Fixed Values
+
Variable Values
```

---

Example

```ts
type Scores = [string, ...number[]];
```

---

Meaning:

```text
First value → string

Remaining values → numbers
```

---

Valid

```ts
const result: Scores = ["Prashant", 90, 95, 100];
```

---

### Named Tuples

Introduced for better readability.

---

Example

```ts
type User = [name: string, age: number];
```

---

Usage

```ts
const user: User = ["Prashant", 25];
```

---

Named tuples do NOT affect runtime.

They improve:

```text
Readability
Documentation
Developer Experience
```

---

### Tuple vs Array

One of the most common interview questions.

---

#### Array

```ts
const values: string[] = ["A", "B", "C"];
```

---

Properties:

```text
Variable Length

Same Type
```

---

#### Tuple

```ts
const user: [string, number] = ["Prashant", 25];
```

---

Properties:

```text
Fixed Length

Fixed Order

Different Types Allowed
```

---

### Comparison Table

| Feature              | Array      | Tuple           |
| -------------------- | ---------- | --------------- |
| Length               | Variable   | Fixed           |
| Order Important      | No         | Yes             |
| Different Types      | Usually No | Yes             |
| Position Based Types | No         | Yes             |
| Real World Usage     | Lists      | Structured Data |

---

### Tuple Destructuring

Very common.

---

Example

```ts
const user: [string, number] = ["Prashant", 25];
```

---

Destructure

```ts
const [name, age] = user;
```

---

Result

```ts
name → "Prashant"

age → 25
```

---

### Function Returning Tuples

Common pattern.

---

Example

```ts
function getUser(): [string, number] {
  return ["Prashant", 25];
}
```

---

Usage

```ts
const [name, age] = getUser();
```

---

### Common Mistakes

---

#### Using Array Instead of Tuple

Wrong

```ts
const point: number[] = [10, 20];
```

---

TypeScript cannot guarantee:

```text
Exactly two values.
```

---

Use:

```ts
[number, number];
```

---

#### Wrong Order

Wrong

```ts
[25, "Prashant"];
```

when tuple expects:

```ts
[string, number];
```

---

#### Confusing Tuple with Object

Tuple

```ts
["Prashant", 25];
```

---

Object

```ts
{
  name: "Prashant",
  age: 25
}
```

---

Objects are usually more readable.

---

### When Should You Use Tuples?

Good Use Cases:

```text
Coordinates

RGB Colors

Database Results

API Status + Message

Function Returns

Structured Fixed Data
```

---

Avoid When:

```text
Data has many fields

Meaning is unclear

Object would be more readable
```

---

Instead use:

```ts
{
  name: string;
  age: number;
}
```

---

### Interview Questions

---

#### Q1

What is a Tuple?

#### Answer

```text
A fixed-length array
where each position has a predefined type.
```

---

#### Q2

Difference between Array and Tuple?

#### Answer

```text
Arrays:
Variable length

Tuples:
Fixed length and fixed types.
```

---

#### Q3

Can Tuples have optional values?

#### Answer

Yes.

```ts
[string, number?]
```

---

#### Q4

Can Tuples have rest elements?

#### Answer

Yes.

```ts
[string, ...number[]]
```

---

#### Q5

Can Tuples be readonly?

#### Answer

Yes.

```ts
readonly[(number, number)];
```

---

### Cheat Sheet

```ts
[string, number];
```

---

```ts
[number, number];
```

---

```ts
readonly[(number, number)];
```

---

```ts
[string, number?]
```

---

```ts
[
  string,
  ...number[]
]
```

---

```ts
[
  name: string,
  age: number
]
```

---

### Key Takeaways

- Tuples are fixed-length arrays with fixed types at specific positions.
- Tuples provide stronger guarantees than regular arrays.
- TypeScript knows the exact type of each tuple element.
- Tuples are useful for coordinates, API responses and function return values.
- Tuples support readonly modifiers.
- Tuples support optional elements.
- Tuples support rest elements.
- Named tuples improve readability.
- Arrays are best for collections of similar data.
- Tuples are best for structured data with a fixed shape.
