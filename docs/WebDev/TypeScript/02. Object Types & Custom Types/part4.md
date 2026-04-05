# Optional Properties & Readonly Properties

> In real-world applications, not every property is always available and not every property should be allowed to change.
>
> Consider:
>
> - A user's phone number may not exist yet.
> - A product may not have a discount.
> - A database ID should never change after creation.
> - Configuration values should remain immutable.
>
> TypeScript provides two powerful features for such scenarios:
>
> ```ts
> Optional Properties (?)
> Readonly Properties (readonly)
> ```
>
> These are heavily used in:
>
> - APIs
> - React Applications
> - Configuration Objects
> - Domain Models
> - Database Entities

---

# Optional Properties

---

## What are Optional Properties?

Normally, every property in an object type is:

```text
Required
```

---

Example:

```ts
type User = {
  name: string;
  age: number;
};
```

---

Valid

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

Invalid

```ts
const user: User = {
  name: "Prashant",
};
```

Error:

```text
Property 'age' is missing
```

---

# Making Properties Optional

Use:

```ts
?
```

after the property name.

---

## Syntax

```ts
type User = {
  property?: Type;
};
```

---

## Example

```ts
type User = {
  name: string;
  age?: number;
};
```

---

Now:

```ts
const user: User = {
  name: "Prashant",
};
```

Valid.

---

Also Valid

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

# How Optional Properties Work Internally

This is a very important concept.

---

When you write:

```ts
type User = {
  age?: number;
};
```

TypeScript internally treats it as:

```ts
type User = {
  age: number | undefined;
};
```

---

Meaning:

```text
The property may exist
or
The property may be undefined
```

---

# Example

```ts
type User = {
  age?: number;
};

const user: User = {};
```

---

Access

```ts
console.log(user.age);
```

Output:

```text
undefined
```

---

# Why Optional Properties Exist

Imagine a profile form.

---

User may provide:

```text
Name
```

but may skip:

```text
Phone Number
```

---

Model

```ts
type UserProfile = {
  name: string;
  phone?: string;
};
```

---

Valid

```ts
{
  name: "Prashant";
}
```

---

Valid

```ts
{
  name: "Prashant",
  phone: "9999999999"
}
```

---

# Optional Properties in Functions

Very common.

---

Example

```ts
type User = {
  name: string;
  age?: number;
};
```

---

```ts
function printUser(user: User) {
  console.log(user.name);
}
```

---

Call

```ts
printUser({
  name: "Prashant",
});
```

Valid.

---

# Accessing Optional Properties Safely

---

Problem

```ts
type User = {
  age?: number;
};

const user: User = {};
```

---

Attempt

```ts
console.log(user.age.toFixed(2));
```

Error.

---

Why?

Because:

```text
age may be undefined
```

---

# Safe Check

```ts
if (user.age !== undefined) {
  console.log(user.age.toFixed(2));
}
```

---

Valid.

---

# Optional Chaining

Modern TypeScript provides:

```ts
?.
```

---

Example

```ts
console.log(user.age?.toFixed(2));
```

---

Behavior

```text
If age exists → execute

If age is undefined → return undefined
```

---

Much cleaner.

---

# Multiple Optional Properties

---

Example

```ts
type User = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};
```

---

Valid

```ts
{
  name: "Prashant";
}
```

---

Valid

```ts
{
  name: "Prashant",
  phone: "9999999999"
}
```

---

# Real World Example

API Response

```ts
type User = {
  id: number;
  name: string;
  profileImage?: string;
};
```

---

Some users may have:

```text
Profile Picture
```

Others may not.

---

Optional properties model this perfectly.

---

# Readonly Properties

---

## What are Readonly Properties?

Readonly properties can:

```text
Be Read
```

but cannot:

```text
Be Modified
```

after creation.

---

# Syntax

```ts
readonly property: Type;
```

---

# Example

```ts
type User = {
  readonly id: number;
  name: string;
};
```

---

Create Object

```ts
const user: User = {
  id: 1,
  name: "Prashant",
};
```

---

Read

```ts
console.log(user.id);
```

Valid.

---

Modify

```ts
user.id = 5;
```

Error.

---

```text
Cannot assign to readonly property
```

---

# Why Use Readonly?

Some values should never change.

Examples:

```text
Database IDs
Order IDs
Product IDs
User IDs
Configuration Values
```

---

# Example

```ts
type Product = {
  readonly productId: number;
  name: string;
};
```

---

Valid

```ts
const product = {
  productId: 101,
  name: "Laptop",
};
```

---

Invalid

```ts
product.productId = 999;
```

---

# Readonly Does NOT Affect Other Properties

---

Example

```ts
type User = {
  readonly id: number;
  name: string;
};
```

---

Valid

```ts
user.name = "John";
```

---

Invalid

```ts
user.id = 5;
```

---

Only readonly properties are protected.

---

# Readonly Arrays

Very common interview topic.

---

Normal Array

```ts
const numbers: number[] = [1, 2, 3];
```

---

Allowed

```ts
numbers.push(4);
```

---

Allowed

```ts
numbers.pop();
```

---

# Readonly Array

```ts
const numbers: readonly number[] = [1, 2, 3];
```

---

Attempt

```ts
numbers.push(4);
```

Error.

---

Attempt

```ts
numbers.pop();
```

Error.

---

Attempt

```ts
numbers[0] = 100;
```

Error.

---

# Alternative Syntax

---

Equivalent

```ts
readonly number[]
```

---

and

```ts
ReadonlyArray<number>;
```

---

Both create immutable arrays.

---

# Example

```ts
const scores: ReadonlyArray<number> = [90, 95, 100];
```

---

Invalid

```ts
scores.push(80);
```

---

# Readonly vs const

One of the most common interview questions.

---

Many beginners think:

```ts
const
```

and

```ts
readonly;
```

are identical.

They are not.

---

# const

Protects:

```text
Variable Reassignment
```

---

Example

```ts
const user = {
  name: "Prashant",
};
```

---

Invalid

```ts
user = {};
```

---

But:

```ts
user.name = "John";
```

Valid.

---

# readonly

Protects:

```text
Property Modification
```

---

Example

```ts
type User = {
  readonly name: string;
};
```

---

Invalid

```ts
user.name = "John";
```

---

# Comparison

| Feature            | const | readonly |
| ------------------ | ----- | -------- |
| Protect Variable   | ✅    | ❌       |
| Protect Property   | ❌    | ✅       |
| Used On Variables  | ✅    | ❌       |
| Used On Properties | ❌    | ✅       |

---

# Combining Optional and Readonly

---

Example

```ts
type User = {
  readonly id: number;
  name: string;
  email?: string;
};
```

---

Valid

```ts
const user: User = {
  id: 1,
  name: "Prashant",
};
```

---

Invalid

```ts
user.id = 2;
```

---

Valid

```ts
user.name = "John";
```

---

Valid

```ts
user.email = "abc@gmail.com";
```

---

# Real World Example

Database Entity

```ts
type User = {
  readonly id: number;
  name: string;
  email?: string;
};
```

---

Meaning:

```text
id
```

Never changes.

---

```text
email
```

May not exist.

---

Perfect real-world modeling.

---

# Common Mistakes

---

## Forgetting Undefined Check

Wrong

```ts
user.age.toFixed(2);
```

---

Correct

```ts
user.age?.toFixed(2);
```

or

```ts
if(user.age !== undefined)
```

---

## Thinking Readonly Exists at Runtime

Important.

---

TypeScript:

```ts
readonly;
```

works only at:

```text
Compile Time
```

---

Generated JavaScript:

```js
No readonly protection exists.
```

---

## Confusing const with readonly

Remember:

```text
const → variable

readonly → property
```

---

# Interview Questions

---

## Q1

What does `?` mean in TypeScript?

### Answer

```text
Optional Property
```

---

## Q2

How does TypeScript internally treat:

```ts
age?: number
```

### Answer

```ts
age: number | undefined;
```

---

## Q3

What does readonly do?

### Answer

```text
Prevents property reassignment.
```

---

## Q4

Difference between const and readonly?

### Answer

```text
const protects variables.

readonly protects properties.
```

---

## Q5

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

# Cheat Sheet

```ts
age?: number;
```

↓

```ts
age: number | undefined;
```

---

```ts
readonly id: number;
```

---

```ts
user.age?.toFixed(2);
```

---

```ts
readonly number[]
```

---

```ts
ReadonlyArray<number>;
```

---

# Key Takeaways

- Optional properties use the `?` operator.
- Optional properties may be missing or undefined.
- Internally, optional properties behave like a union with `undefined`.
- Always safely access optional properties.
- Readonly properties cannot be reassigned after creation.
- Readonly is useful for IDs and immutable data.
- Readonly arrays prevent modification operations.
- `const` and `readonly` solve different problems.
- Both optional and readonly properties are extremely common in production TypeScript code.
- These concepts form the foundation for Interfaces, Classes and API Modeling.

---


---\n*Last refined on April 15, 2026*
