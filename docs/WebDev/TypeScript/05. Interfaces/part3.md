# Interface vs Type

> One of the most common TypeScript interview questions is:
>
> ```text
> Interface vs Type Alias
> ```
>
> Both can be used to describe object structures.
>
> Example:
>
> ```ts
> interface User {
>   name: string;
>   age: number;
> }
> ```
>
> and
>
> ```ts
> type User = {
>   name: string;
>   age: number;
> };
> ```
>
> Both appear identical.
>
> So:
>
> ```text
> Why does TypeScript provide both?
> When should we use each?
> What are the differences?
> ```
>
> This chapter answers those questions.

---

### First Important Truth

For most basic object definitions:

```ts
interface User {
  name: string;
  age: number;
}
```

and

```ts
type User = {
  name: string;
  age: number;
};
```

are effectively identical.

---

Both provide:

```text
Type Safety
Autocompletion
Error Checking
Object Validation
```

---

### Similarities

Both can describe:

---

#### Objects

Interface

```ts
interface User {
  name: string;
}
```

---

Type

```ts
type User = {
  name: string;
};
```

---

### Function Types

Interface

```ts
interface Add {
  (a: number, b: number): number;
}
```

---

Type

```ts
type Add = (a: number, b: number) => number;
```

---

### Arrays

Type

```ts
type Users = User[];
```

---

Interface

```ts
interface Users extends Array<User> {}
```

---

Possible, but type aliases are usually cleaner.

---

### Both Support Extension

Interface

```ts
interface User {
  name: string;
}
```

---

```ts
interface Admin extends User {
  permissions: string[];
}
```

---

Type

```ts
type User = {
  name: string;
};
```

---

```ts
type Admin = User & {
  permissions: string[];
};
```

---

Both achieve similar results.

---

### Major Difference #1

### Declaration Merging

This is the biggest difference.

---

### Interface Supports Merging

Example

```ts
interface User {
  name: string;
}
```

---

```ts
interface User {
  age: number;
}
```

---

Result

```ts
interface User {
  name: string;
  age: number;
}
```

---

TypeScript automatically combines them.

---

Usage

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

Valid.

---

### Type Alias Does NOT Support Merging

Example

```ts
type User = {
  name: string;
};
```

---

```ts
type User = {
  age: number;
};
```

---

Error

```text
Duplicate Identifier
```

---

Type aliases cannot be reopened.

---

### Visual Summary

Interface

```ts
interface User {
  name: string;
}

interface User {
  age: number;
}
```

↓

```ts
{
  name: string;
  age: number;
}
```

---

Type

```ts
type User = {
  name: string;
};

type User = {
  age: number;
};
```

↓

```text
Compilation Error
```

---

### Major Difference #2

### Type Aliases Can Represent More Than Objects

Interfaces mainly describe:

```text
Object Shapes
```

---

Type aliases can describe:

```text
Objects
Primitives
Unions
Intersections
Tuples
Mapped Types
Conditional Types
```

---

### Primitive Types

Possible

```ts
type ID = string;
```

---

Not Possible

```ts
interface ID extends string {}
```

---

### Union Types

Possible

```ts
type Status = "success" | "error" | "loading";
```

---

Interface?

```ts
interface Status {}
```

Impossible.

---

### Tuple Types

Possible

```ts
type User = [string, number];
```

---

Interface?

Not practical.

---

### Conditional Types

Possible

```ts
type Result<T> = T extends string ? number : boolean;
```

---

Interfaces cannot do this.

---

### Major Difference #3

### Extension Syntax

Interfaces use:

```ts
extends
```

---

Example

```ts
interface User {
  name: string;
}
```

---

```ts
interface Admin extends User {
  permissions: string[];
}
```

---

Type aliases use:

```ts
&
```

(Intersection)

---

Example

```ts
type User = {
  name: string;
};
```

---

```ts
type Admin = User & {
  permissions: string[];
};
```

---

### Interface Extension

Produces:

```ts
{
  name: string;
  permissions: string[];
}
```

---

### Type Intersection

Produces:

```ts
{
  name: string;
  permissions: string[];
}
```

---

Result looks similar.

Implementation differs.

---

### Major Difference #4

### Error Messages

Interfaces often produce cleaner errors.

---

Example

```ts
interface User {
  name: string;
}
```

---

Error

```text
Type X is not assignable to User
```

---

Easy to understand.

---

Type aliases involving:

```ts
Union Types
Intersection Types
Generics
Conditional Types
```

can produce longer errors.

---

### Major Difference #5

### Library Development

Large libraries prefer interfaces for public contracts.

---

Example

```ts
interface Window {
  myAppVersion: string;
}
```

---

Why?

Because users can extend it later.

---

Example

```ts
interface Window {
  analytics: AnalyticsService;
}
```

---

Declaration merging makes this possible.

---

Type aliases cannot do this.

---

### Interface Extension vs Type Intersection

Frequently asked interview question.

---

Interface

```ts
interface A {
  name: string;
}
```

---

```ts
interface B extends A {
  age: number;
}
```

---

Result

```ts
{
  name: string;
  age: number;
}
```

---

Type

```ts
type A = {
  name: string;
};
```

---

```ts
type B = A & {
  age: number;
};
```

---

Result

```ts
{
  name: string;
  age: number;
}
```

---

Looks identical.

---

But intersections can create conflicts.

---

### Property Conflict Example

Type A

```ts
type A = {
  id: string;
};
```

---

Type B

```ts
type B = {
  id: number;
};
```

---

Intersection

```ts
type Result = A & B;
```

---

Result

```ts
{
  id: never;
}
```

---

Impossible type.

---

Interfaces catch conflicts earlier.

---

### Performance Considerations

The TypeScript team has mentioned that:

```text
Interfaces are generally easier
for the compiler to optimize.
```

---

Difference is usually negligible.

---

Do not choose based on performance.

---

Choose based on design.

---

### Modern Industry Practice

Most large codebases follow:

---

Use Interface For

```text
Object Models
API Contracts
Class Contracts
Public Libraries
Extendable Structures
```

---

Use Type Alias For

```text
Union Types
Intersection Types
Tuples
Mapped Types
Conditional Types
Utility Types
```

---

### Real World Example

User Model

```ts
interface User {
  id: number;
  name: string;
}
```

---

Request Status

```ts
type Status = "loading" | "success" | "error";
```

---

This is extremely common.

---

### Recommended Rule

A practical rule used by many teams:

---

If describing:

```text
Object Shape
```

Prefer:

```ts
interface;
```

---

If describing:

```text
Anything Else
```

Prefer:

```ts
type;
```

---

Simple and effective.

---

### Common Mistakes

---

#### Using Type Alias for Everything

Possible.

---

But you lose:

```text
Declaration Merging
Interface Extension Benefits
```

---

#### Using Interface for Unions

Wrong

```ts
interface Status {}
```

for:

```ts
"success" | "error";
```

---

Use:

```ts
type;
```

instead.

---

#### Forgetting Declaration Merging

Interfaces merge.

Types do not.

---

### Comparison Table

| Feature             | Interface  | Type Alias |
| ------------------- | ---------- | ---------- |
| Object Types        | ✅         | ✅         |
| Function Types      | ✅         | ✅         |
| Extension           | ✅ extends | ✅ &       |
| Declaration Merging | ✅         | ❌         |
| Union Types         | ❌         | ✅         |
| Intersection Types  | ❌         | ✅         |
| Tuples              | ❌         | ✅         |
| Primitive Aliases   | ❌         | ✅         |
| Conditional Types   | ❌         | ✅         |
| Mapped Types        | ❌         | ✅         |

---

### Interview Questions

---

#### Q1

What is the biggest difference between Interface and Type?

#### Answer

```text
Interfaces support Declaration Merging.

Type Aliases do not.
```

---

#### Q2

Can Interfaces represent Union Types?

#### Answer

No.

Use Type Aliases.

---

#### Q3

Can Type Aliases represent Primitive Types?

#### Answer

Yes.

```ts
type ID = string;
```

---

#### Q4

What is Declaration Merging?

#### Answer

Multiple interfaces with the same name automatically combine.

---

#### Q5

When should you use Interface?

#### Answer

For object structures and public contracts.

---

#### Q6

When should you use Type Alias?

#### Answer

For unions, intersections, tuples and advanced type manipulation.

---

### Cheat Sheet

```ts
interface User {
  name: string;
}
```

---

```ts
type Status = "success" | "error";
```

---

```ts
interface Admin extends User {}
```

---

```ts
type Admin = User & {
  permissions: string[];
};
```

---

```ts
interface User {
  name: string;
}

interface User {
  age: number;
}
```

↓

```ts
{
  name: string;
  age: number;
}
```

---

### Key Takeaways

- Interfaces and Type Aliases are similar for basic object definitions.
- Interfaces support Declaration Merging.
- Type Aliases support unions, tuples, primitives and advanced type transformations.
- Interfaces use `extends`; Type Aliases use intersections (`&`).
- Interfaces are preferred for object contracts and public APIs.
- Type Aliases are preferred for advanced type manipulation.
- Declaration Merging is the most important interview difference.
- Modern TypeScript projects use both extensively.
- Neither is universally better; each solves different problems.
- Understanding both is essential for professional TypeScript development.
