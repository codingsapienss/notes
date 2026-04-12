# Advanced Interfaces

> In previous chapter, we learned how Interfaces define the structure of objects.
>
> In real-world applications, interfaces are used for much more than objects.
>
> They can describe:
>
> - Functions
> - Dynamic Objects
> - Inheritance Hierarchies
> - API Contracts
> - React Props
> - Class Contracts
>
> This chapter covers the advanced capabilities of interfaces that are heavily used in production TypeScript applications.

---

# Function Interfaces

---

## What is a Function Interface?

An Interface can describe the structure of a function.

---

Instead of:

```ts
type AddFunction = (a: number, b: number) => number;
```

we can use:

```ts
interface AddFunction {
  (a: number, b: number): number;
}
```

---

# Example

```ts
interface AddFunction {
  (a: number, b: number): number;
}
```

---

Implementation

```ts
const add: AddFunction = (a, b) => {
  return a + b;
};
```

---

Usage

```ts
console.log(add(10, 20));
```

Output

```text
30
```

---

# Why Use Function Interfaces?

Useful when:

```text
Many functions share
the same signature.
```

---

Example

```ts
interface Calculator {
  (a: number, b: number): number;
}
```

---

```ts
const add: Calculator = (a, b) => a + b;

const multiply: Calculator = (a, b) => a * b;
```

---

Both follow the same contract.

---

# Function Interface with Object Properties

Interfaces can describe:

```text
Functions + Properties
```

simultaneously.

---

Example

```ts
interface Counter {
  (start: number): string;

  count: number;
}
```

---

Meaning:

```text
Counter is callable
and
contains a count property.
```

---

This pattern is used in advanced libraries.

---

# Index Signatures

One of the most important interface features.

---

# Problem

Normally:

```ts
interface User {
  name: string;
  age: number;
}
```

---

Only these properties are allowed.

---

But what if keys are dynamic?

Example:

```ts
{
  math: 90,
  science: 95,
  english: 85
}
```

---

Property names are not known beforehand.

---

# Solution

Use Index Signatures.

---

## Syntax

```ts
interface InterfaceName {
  [key: string]: Type;
}
```

---

# Example

```ts
interface Scores {
  [subject: string]: number;
}
```

---

Usage

```ts
const marks: Scores = {
  math: 95,
  science: 90,
  english: 88,
};
```

---

Valid.

---

# Why Does This Work?

Interface says:

```text
Any string key
must contain a number value.
```

---

Therefore:

```ts
math: 95;
```

Valid.

---

```ts
science: 90;
```

Valid.

---

# Invalid Example

```ts
const marks: Scores = {
  math: 95,
  english: "A",
};
```

Error.

---

Because:

```text
Value must be number.
```

---

# Number Index Signatures

---

Example

```ts
interface NumberMap {
  [index: number]: string;
}
```

---

Usage

```ts
const users: NumberMap = {
  0: "Prashant",
  1: "John",
};
```

---

Valid.

---

# Real World Example

API Dictionary

```ts
interface Users {
  [id: string]: {
    name: string;
  };
}
```

---

Usage

```ts
const users: Users = {
  "101": {
    name: "Prashant",
  },

  "102": {
    name: "John",
  },
};
```

---

Very common in backend systems.

---

# Mixing Explicit Properties with Index Signatures

Allowed.

---

Example

```ts
interface User {
  id: number;

  [key: string]: string | number;
}
```

---

Usage

```ts
const user: User = {
  id: 1,
  name: "Prashant",
  city: "Delhi",
};
```

---

Valid.

---

# Important Rule

Explicit properties must be compatible with the index signature.

---

Example

```ts
interface User {
  id: number;

  [key: string]: string | number;
}
```

---

Valid because:

```ts
id;
```

is:

```ts
number;
```

which belongs to:

```ts
string | number;
```

---

# Interface Extension

One of the most powerful interface features.

---

# Why Extension?

Without extension:

```ts
interface User {
  id: number;
  name: string;
}
```

---

```ts
interface Admin {
  id: number;
  name: string;
  permissions: string[];
}
```

---

Repeated properties.

---

Extension eliminates duplication.

---

# Syntax

```ts
interface Child extends Parent {}
```

---

# Example

```ts
interface User {
  id: number;
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

Result

```ts
{
  id: number;
  name: string;
  permissions: string[];
}
```

---

# Usage

```ts
const admin: Admin = {
  id: 1,

  name: "Prashant",

  permissions: ["read", "write"],
};
```

---

# Visual Representation

```text
User
 ├─ id
 └─ name

Admin
 ├─ id
 ├─ name
 └─ permissions
```

---

# Multiple Interface Extension

Interfaces can inherit from multiple interfaces.

---

Example

```ts
interface Person {
  name: string;
}
```

---

```ts
interface Employee {
  employeeId: number;
}
```

---

```ts
interface Admin {
  permissions: string[];
}
```

---

Combined

```ts
interface SuperAdmin extends Person, Employee, Admin {}
```

---

Result

```ts
{
  name: string;
  employeeId: number;
  permissions: string[];
}
```

---

# Usage

```ts
const admin: SuperAdmin = {
  name: "Prashant",

  employeeId: 101,

  permissions: ["all"],
};
```

---

# Interface Inheritance Hierarchy

Real projects often create inheritance chains.

---

Example

```ts
interface Entity {
  id: number;
}
```

---

```ts
interface User extends Entity {
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

Result

```text
Entity
   ↓
 User
   ↓
 Admin
```

---

Very common.

---

# Declaration Merging

This is the biggest difference between:

```text
Interface
```

and

```text
Type Alias
```

---

# What is Declaration Merging?

TypeScript automatically merges interfaces having the same name.

---

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

TypeScript combines them.

---

# Usage

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

Valid.

---

# Why Is Declaration Merging Useful?

Large libraries often extend existing interfaces.

---

Example

```ts
interface Window {
  myAppVersion: string;
}
```

---

Now:

```ts
window.myAppVersion;
```

becomes available everywhere.

---

This is heavily used in:

```text
Browser APIs
Node.js Typings
Third-party Libraries
```

---

# Type Alias Comparison

Interfaces

```ts
interface User {
  name: string;
}

interface User {
  age: number;
}
```

Valid.

---

Type Alias

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

Error.

---

```text
Duplicate Identifier
```

---

# Real World Example

API Models

---

Base Interface

```ts
interface ApiResponse {
  success: boolean;
}
```

---

Extended Interface

```ts
interface UserResponse extends ApiResponse {
  user: {
    id: number;
    name: string;
  };
}
```

---

Usage

```ts
const response: UserResponse = {
  success: true,

  user: {
    id: 1,
    name: "Prashant",
  },
};
```

---

# Common Mistakes

---

## Using Extension When Composition Is Better

Avoid:

```ts
A extends B
extends C
extends D
extends E
```

---

Deep hierarchies become difficult to maintain.

---

## Forgetting Declaration Merging

Interfaces merge automatically.

---

Two interfaces with same name:

```ts
interface User {}
interface User {}
```

---

are combined.

---

Not overwritten.

---

## Wrong Index Signature Type

Wrong

```ts
interface Scores {
  [key: string]: number;
}
```

---

```ts
{
  math: "90";
}
```

Error.

---

Value must be:

```ts
number;
```

---

# Interview Questions

---

## Q1

Can Interfaces describe functions?

### Answer

Yes.

```ts
interface Add {
  (a: number, b: number): number;
}
```

---

## Q2

What is an Index Signature?

### Answer

A way to describe dynamic property names.

---

Example:

```ts
[key: string]: number
```

---

## Q3

Can an Interface extend another Interface?

### Answer

Yes.

```ts
interface Admin extends User {}
```

---

## Q4

Can an Interface extend multiple Interfaces?

### Answer

Yes.

```ts
interface A extends B, C {}
```

---

## Q5

What is Declaration Merging?

### Answer

Interfaces with the same name are automatically combined by TypeScript.

---

## Q6

Do Type Aliases support Declaration Merging?

### Answer

No.

Only interfaces support declaration merging.

---

# Cheat Sheet

```ts
interface Add {
  (a: number, b: number): number;
}
```

---

```ts
interface Scores {
  [key: string]: number;
}
```

---

```ts
interface Admin extends User {}
```

---

```ts
interface Admin extends User, Employee {}
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

# Key Takeaways

- Interfaces can describe functions, not just objects.
- Index Signatures support dynamic property names.
- Interface Extension promotes reusability and avoids duplication.
- Interfaces can inherit from multiple interfaces.
- Declaration Merging is a unique feature of interfaces.
- Interfaces are heavily used in API contracts and library typings.
- Index Signatures are common when working with dictionaries and maps.
- Extension helps create scalable type hierarchies.
- Declaration Merging is one of the major differences between interfaces and type aliases.
- Advanced interface concepts are widely used in large TypeScript codebases.

---


---\n*Last refined on April 18, 2026*


---\n*Last refined on April 28, 2026*


---\n*Last refined on April 29, 2026*


---\n*Last refined on April 29, 2026*


---\n*Last refined on April 30, 2026*
