# Generic Functions

> Generics are one of the most powerful features in TypeScript.
>
> They allow us to write:
>
> ```text
> Reusable
> Type-Safe
> Flexible
> Functions
> ```
>
> without sacrificing type safety.
>
> Generics are heavily used in:
>
> - React
> - Angular
> - NestJS
> - Express
> - TypeScript Utility Types
> - APIs
> - Libraries
>
> Understanding Generics is a major step toward becoming an advanced TypeScript developer.

---

# The Problem Before Generics

Suppose we want a function that returns the value passed to it.

---

Example

```ts
function getValue(value: string) {
  return value;
}
```

---

Usage

```ts
const result = getValue("Hello");
```

Works.

---

But:

```ts
getValue(10);
```

Error.

---

Because function only accepts:

```ts
string;
```

---

# Solution 1 — Use any

```ts
function getValue(value: any) {
  return value;
}
```

---

Usage

```ts
getValue("Hello");

getValue(10);

getValue(true);
```

Works.

---

Problem:

```text
Type Safety Lost
```

---

Example

```ts
const result = getValue("Hello");
```

---

TypeScript infers:

```ts
any;
```

---

Meaning:

```ts
result.toUpperCase();
```

Works.

---

But:

```ts
result.xyz.abc.def;
```

also compiles.

---

No safety.

---

# Why any is Dangerous?

Consider:

```ts
function identity(value: any) {
  return value;
}
```

---

Usage

```ts
const result = identity("Prashant");
```

---

Type:

```ts
any;
```

---

TypeScript no longer knows:

```text
Result is string
```

---

We need:

```text
Flexibility
+
Type Safety
```

---

# Enter Generics

Generics allow us to:

```text
Pass Types
as Parameters
```

---

Think of Generics as:

```text
Variables for Types
```

---

# Generic Function Syntax

```ts
function fn<T>(value: T): T {
  return value;
}
```

---

Here:

```ts
T;
```

means:

```text
Type Placeholder
```

---

When function is called:

```text
T gets replaced
with actual type
```

---

# First Generic Function

```ts
function identity<T>(value: T): T {
  return value;
}
```

---

Usage

```ts
const result = identity("Hello");
```

---

TypeScript infers:

```ts
T = string;
```

---

Result Type

```ts
string;
```

---

Usage

```ts
const result = identity(100);
```

---

TypeScript infers:

```ts
T = number;
```

---

Result Type

```ts
number;
```

---

Same function.

Multiple types.

---

# Visualizing Generics

Function:

```ts
identity<T>(value:T)
```

---

Call:

```ts
identity("Hello");
```

---

TypeScript converts internally:

```ts
identity<string>("Hello");
```

---

Call:

```ts
identity(100);
```

---

Internally:

```ts
identity<number>(100);
```

---

# Explicit Generic Types

Normally TypeScript infers types automatically.

---

Example

```ts
identity("Hello");
```

---

Inference:

```ts
T = string;
```

---

You can also specify explicitly.

---

Example

```ts
identity<string>("Hello");
```

---

Another Example

```ts
identity<number>(100);
```

---

Both are valid.

---

# Why Are Generic Functions Useful?

Without Generics:

```ts
function getString(value: string) {}

function getNumber(value: number) {}

function getBoolean(value: boolean) {}
```

---

Multiple functions needed.

---

With Generics:

```ts
function getValue<T>(value: T) {
  return value;
}
```

---

Single reusable function.

---

# Generic Function with Arrays

---

Example

```ts
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
```

---

Usage

```ts
const value = getFirst([10, 20, 30]);
```

---

TypeScript infers:

```ts
T = number;
```

---

Result Type

```ts
number;
```

---

Usage

```ts
const name = getFirst(["A", "B", "C"]);
```

---

Type:

```ts
string;
```

---

# Generic Function with Objects

---

Example

```ts
function printValue<T>(obj: T) {
  console.log(obj);
}
```

---

Usage

```ts
printValue({
  name: "Prashant",
  age: 25,
});
```

---

TypeScript infers:

```ts
T = {
  name:string;
  age:number;
}
```

---

# Multiple Generic Parameters

Generics are not limited to one type.

---

Example

```ts
function createPair<T, U>(first: T, second: U) {
  return {
    first,
    second,
  };
}
```

---

Usage

```ts
const pair = createPair("Prashant", 25);
```

---

Inference

```ts
T = string;

U = number;
```

---

Result

```ts
{
  first: string;
  second: number;
}
```

---

# Generic Tuples

---

Example

```ts
function createPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

---

Usage

```ts
const pair = createPair("Age", 25);
```

---

Result Type

```ts
[string, number];
```

---

Output

```ts
["Age", 25];
```

---

# Generic Function with Return Types

---

Example

```ts
function wrap<T>(value: T) {
  return {
    data: value,
  };
}
```

---

Usage

```ts
const result = wrap("Hello");
```

---

Result Type

```ts
{
  data: string;
}
```

---

# Generic Function Preserves Types

This is the biggest advantage.

---

Example

```ts
function identity<T>(value: T): T {
  return value;
}
```

---

Usage

```ts
const name = identity("Prashant");
```

---

Type

```ts
string;
```

---

Usage

```ts
const age = identity(25);
```

---

Type

```ts
number;
```

---

Type safety preserved automatically.

---

# Real World Example

API Wrapper

---

Without Generics

```ts
function apiResponse(data: any) {
  return {
    success: true,
    data,
  };
}
```

---

Problem:

```text
data becomes any
```

---

With Generics

```ts
function apiResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}
```

---

Usage

```ts
const response = apiResponse({
  id: 1,
  name: "Prashant",
});
```

---

Type

```ts
{
  success: boolean;
  data: {
    id: number;
    name: string;
  }
}
```

---

Extremely useful.

---

# Common Naming Conventions

Most common:

```ts
T;
```

means:

```text
Type
```

---

Other common names:

```ts
T;
U;
V;
K;
```

---

Examples

```ts
function fn<T>() {}
```

---

```ts
function pair<T, U>() {}
```

---

```ts
function map<K, V>() {}
```

---

# Common Mistakes

---

## Using any Instead of Generics

Bad

```ts
function fn(value: any) {}
```

---

Prefer

```ts
function fn<T>(value: T) {}
```

---

## Creating Unnecessary Generics

Wrong

```ts
function add<T>(a: number, b: number) {}
```

---

No generic needed.

---

Use Generics only when:

```text
Type must vary
```

---

## Forgetting Return Type Relationship

Bad

```ts
function fn<T>(value: T): any {
  return value;
}
```

---

This defeats the purpose.

---

Use:

```ts
function fn<T>(value: T): T;
```

---

# Interview Questions

---

## Q1

What are Generics?

### Answer

```text
Generics allow types
to be passed as parameters.
```

---

## Q2

Why are Generics needed?

### Answer

```text
To achieve
reusability
and type safety.
```

---

## Q3

What is T?

### Answer

```text
A type parameter
(type placeholder).
```

---

## Q4

Difference between any and Generics?

### Answer

```text
any:
Loses type safety.

Generics:
Preserve type information.
```

---

## Q5

Can a Generic Function have multiple type parameters?

### Answer

```text
Yes.
```

Example:

```ts
function pair<T, U>();
```

---

# Cheat Sheet

```ts
function fn<T>(value: T): T;
```

---

```ts
identity<string>("Hello");
```

---

```ts
identity<number>(100);
```

---

```ts
function first<T>(arr: T[]);
```

---

```ts
function pair<T, U>(a: T, b: U);
```

---

```ts
[T, U];
```

Generic Tuple

---

# Key Takeaways

- Generics allow types to be passed as parameters.
- Generics provide flexibility without losing type safety.
- `T` is a type placeholder.
- TypeScript usually infers generic types automatically.
- Generic functions work with strings, numbers, objects, arrays, and custom types.
- Multiple generic parameters are supported.
- Generic tuples allow strongly typed pairs and structures.
- Generics are widely used in APIs, libraries, frameworks, and utility types.
- Prefer Generics over `any` whenever type information should be preserved.
- Generics are the foundation of advanced TypeScript programming.

---
 
 


---\n*Last refined on April 17, 2026*


---\n*Last refined on April 23, 2026*
