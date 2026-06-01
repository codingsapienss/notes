# Primitive Types, Type Annotations & Type Inference

> Everything in TypeScript starts with types.
>
> Before learning:
>
> - Objects
> - Interfaces
> - Classes
> - Generics
> - Advanced Type Manipulation
>
> you must understand:
>
> ```text
> Primitive Types
> ```
>
> because every complex type is ultimately built from primitive types.

---

# What are Primitive Types?

Primitive Types are the most basic data types available in TypeScript.

They represent:

```text
Single Values
```

Examples:

```ts
string;
number;
boolean;
null;
undefined;
symbol;
bigint;
```

---

# Primitive Types in TypeScript

| Type      | Example    |
| --------- | ---------- |
| string    | "Prashant" |
| number    | 25         |
| boolean   | true       |
| null      | null       |
| undefined | undefined  |
| symbol    | Symbol()   |
| bigint    | 123n       |

---

# Type Annotation

Type Annotation means:

```text
Explicitly telling TypeScript
what type a variable should store.
```

---

## Syntax

```ts
let variableName: Type = value;
```

---

## Example

```ts
let username: string = "Prashant";
```

Here:

```text
Variable = username

Type = string

Value = "Prashant"
```

---

# Why Use Type Annotations?

Without TypeScript:

```js
let age = 25;

age = "hello";
```

Valid JavaScript.

---

With TypeScript:

```ts
let age: number = 25;

age = "hello";
```

Error:

```text
Type 'string' is not assignable to type 'number'
```

---

# String Type

Represents text values.

---

## Example

```ts
let firstName: string = "Prashant";
```

---

## Valid Values

```ts
let city: string = "Delhi";

let company: string = "OpenAI";
```

---

## Invalid

```ts
let city: string = 100;
```

Error:

```text
Type 'number' is not assignable to type 'string'
```

---

# String Methods

TypeScript automatically understands available methods.

---

```ts
let name: string = "prashant";

console.log(name.toUpperCase());
```

Output:

```text
PRASHANT
```

---

## IntelliSense Benefit

TypeScript knows:

```text
name is a string
```

therefore suggests:

```ts
toUpperCase();
toLowerCase();
trim();
includes();
replace();
```

---

# Number Type

Represents:

```text
Integers
Floats
Negative Numbers
Infinity
NaN
```

Unlike some languages:

```ts
number;
```

handles all numeric values.

---

## Example

```ts
let age: number = 25;
```

---

## Decimal

```ts
let price: number = 99.99;
```

---

## Negative

```ts
let balance: number = -500;
```

---

## Scientific Notation

```ts
let population: number = 1.5e9;
```

---

# Special Number Values

---

## Infinity

```ts
let value: number = Infinity;
```

---

## NaN

```ts
let result: number = NaN;
```

---

Example:

```ts
console.log(0 / 0);
```

Output:

```text
NaN
```

---

# Boolean Type

Represents:

```text
true
false
```

only.

---

## Example

```ts
let isLoggedIn: boolean = true;
```

---

```ts
let isAdmin: boolean = false;
```

---

# Common Usage

```ts
if (isLoggedIn) {
  console.log("Welcome");
}
```

---

# Undefined Type

Represents:

```text
Value not assigned yet
```

---

## Example

```ts
let username: undefined = undefined;
```

---

More commonly:

```ts
let username: string | undefined;
```

covered later in Union Types.

---

# Null Type

Represents:

```text
Intentional absence of value
```

---

## Example

```ts
let selectedUser: null = null;
```

---

# Difference Between Null and Undefined

| Feature     | null                | undefined    |
| ----------- | ------------------- | ------------ |
| Meaning     | Intentionally empty | Not assigned |
| Assigned By | Developer           | JavaScript   |
| Type        | null                | undefined    |

---

## Example

```ts
let user = null;
```

Meaning:

```text
User intentionally doesn't exist.
```

---

```ts
let age;
```

Meaning:

```text
Value not assigned.
```

---

# BigInt Type

Used for very large integers.

---

## Problem with number

JavaScript numbers become unsafe after:

```text
9007199254740991
```

---

Example

```ts
console.log(9007199254740992);
console.log(9007199254740993);
```

Unexpected results may occur.

---

# BigInt Solution

```ts
let largeNumber: bigint = 9007199254740993n;
```

Notice:

```text
n suffix
```

---

## Example

```ts
let population: bigint = 9999999999999999999n;
```

---

# BigInt Rules

---

Valid

```ts
10n + 20n;
```

---

Invalid

```ts
10n + 20;
```

Error.

---

Must convert first.

```ts
BigInt(20);
```

---

# Symbol Type

One of the least used primitive types.

---

Used to create:

```text
Unique Identifiers
```

---

## Example

```ts
const id1 = Symbol();
const id2 = Symbol();
```

---

Comparison

```ts
console.log(id1 === id2);
```

Output:

```text
false
```

---

Even though both were created the same way.

---

# Why Symbols Exist?

Avoid key collisions.

---

Example

```ts
const id = Symbol("id");

const user = {
  [id]: 123,
};
```

---

# Type Inference

One of TypeScript's most powerful features.

---

# What is Type Inference?

TypeScript can automatically determine the type.

---

Instead of:

```ts
let username: string = "Prashant";
```

you can write:

```ts
let username = "Prashant";
```

---

TypeScript infers:

```text
string
```

automatically.

---

# Example

```ts
let age = 25;
```

TypeScript infers:

```ts
number;
```

---

Now:

```ts
age = "hello";
```

Error.

---

# Inference Examples

---

## String

```ts
let city = "Delhi";
```

Inference:

```ts
string;
```

---

## Number

```ts
let score = 100;
```

Inference:

```ts
number;
```

---

## Boolean

```ts
let isActive = true;
```

Inference:

```ts
boolean;
```

---

# When Should You Use Explicit Types?

Use explicit annotations when:

---

## Function Parameters

```ts
function greet(name: string) {}
```

---

## API Models

```ts
type User = {
  id: number;
  name: string;
};
```

---

## Public Interfaces

```ts
interface Product {
  id: number;
}
```

---

# When Can You Rely on Inference?

---

## Local Variables

```ts
let count = 10;
```

---

## Simple Values

```ts
const city = "Delhi";
```

---

# let vs const Inference

Important Interview Topic.

---

## let

```ts
let city = "Delhi";
```

Type:

```ts
string;
```

---

Any string allowed later.

```ts
city = "Mumbai";
```

Valid.

---

## const

```ts
const city = "Delhi";
```

Type becomes:

```ts
"Delhi";
```

Literal Type.

---

Cannot reassign.

```ts
city = "Mumbai";
```

Error.

---

# Type Widening

---

## Example

```ts
let status = "active";
```

TypeScript widens:

```ts
string;
```

---

because value may change later.

---

# Literal Type Inference

---

```ts
const status = "active";
```

Type:

```ts
"active";
```

not:

```ts
string;
```

---

# Common Mistakes

---

## Mixing Types

```ts
let age: number = 25;

age = "twenty five";
```

Error.

---

## Using BigInt with Number

Wrong

```ts
10n + 20;
```

---

Correct

```ts
10n + BigInt(20);
```

---

## Confusing null and undefined

Wrong assumption:

```text
Both are identical.
```

They are different values.

---

# Interview Questions

---

## Q1

What are Primitive Types?

### Answer

```text
The basic built-in data types such as:
string, number, boolean, null,
undefined, bigint and symbol.
```

---

## Q2

What is Type Annotation?

### Answer

```text
Explicitly specifying the type of a variable.
```

---

## Q3

What is Type Inference?

### Answer

```text
TypeScript automatically determining a type.
```

---

## Q4

Difference between null and undefined?

### Answer

```text
null → intentional absence of value

undefined → value not assigned
```

---

## Q5

Why was bigint introduced?

### Answer

```text
To safely represent integers larger than
Number.MAX_SAFE_INTEGER.
```

---

# Cheat Sheet

```ts
let name: string = "Prashant";
```

```ts
let age: number = 25;
```

```ts
let isAdmin: boolean = false;
```

```ts
let value: null = null;
```

```ts
let value: undefined = undefined;
```

```ts
let bigNumber: bigint = 123n;
```

```ts
const id = Symbol();
```

```ts
let city = "Delhi"; // inferred string
```

---

# Key Takeaways

- Primitive Types are the foundation of TypeScript's type system.
- Type Annotation explicitly defines a type.
- Type Inference automatically determines a type.
- `string`, `number`, and `boolean` are the most commonly used primitive types.
- `null` and `undefined` represent different concepts.
- `bigint` is used for very large integers.
- `symbol` provides unique identifiers.
- TypeScript can infer types in many situations.
- Prefer inference for simple local variables.
- Use explicit annotations for public APIs, function parameters, and shared types.

---
 


---\n*Last refined on April 17, 2026*


---\n*Last refined on April 21, 2026*


---\n*Last refined on April 28, 2026*
