# Generic Constraints, `extends`, `keyof` & Default Generics

> Generics are extremely powerful because they allow us to write reusable code.
>
> However, there is a problem:
>
> ```text
> Generics are TOO Flexible
> ```
>
> A generic type can become:
>
> ```ts
> string
> number
> boolean
> object
> array
> class
> interface
> ```
>
> Sometimes we need to tell TypeScript:
>
> ```text
> "I want flexibility,
> but not unlimited flexibility."
> ```
>
> This is where:
>
> ```ts
> Generic Constraints
> ```
>
> become useful.

---

# Why Do We Need Constraints?

Consider:

```ts
function getLength<T>(value: T) {
  return value.length;
}
```

---

Looks correct.

---

Usage

```ts
getLength("Hello");
```

Works.

---

```ts
getLength([1, 2, 3]);
```

Works.

---

But:

```ts
getLength(100);
```

Error.

---

Why?

Because TypeScript only knows:

```ts
T;
```

could be:

```text
Anything
```

---

And not every type has:

```ts
length;
```

property.

---

For example:

```ts
string   → has length
array    → has length
number   → no length
boolean  → no length
```

---

TypeScript Error

```text
Property 'length'
does not exist on type 'T'
```

---

We need a way to say:

```text
T must have a length property
```

---

# Generic Constraints

A Generic Constraint restricts what types can be used.

---

Syntax

```ts
<T extends SomeType>
```

---

Read it as:

```text
T must satisfy SomeType
```

or

```text
T must extend SomeType
```

---

# First Constraint Example

---

Create Interface

```ts
interface HasLength {
  length: number;
}
```

---

Generic Function

```ts
function getLength<T extends HasLength>(value: T) {
  return value.length;
}
```

---

Now TypeScript guarantees:

```text
length exists
```

---

Valid

```ts
getLength("Hello");
```

Output

```text
5
```

---

Valid

```ts
getLength([10, 20, 30]);
```

Output

```text
3
```

---

Invalid

```ts
getLength(100);
```

Error.

---

Because:

```text
number
```

does not satisfy:

```ts
HasLength;
```

---

# Visualizing Constraints

Without Constraint

```ts
<T>
```

means:

```text
Anything
```

---

With Constraint

```ts
<T extends HasLength>
```

means:

```text
Only types having length
```

---

# Constraint Using Objects

---

Interface

```ts
interface User {
  id: number;
}
```

---

Function

```ts
function printId<T extends User>(user: T) {
  console.log(user.id);
}
```

---

Valid

```ts
printId({
  id: 1,
  name: "Prashant",
});
```

Output

```text
1
```

---

Invalid

```ts
printId({
  name: "Prashant",
});
```

Error.

---

Because:

```text
id missing
```

---

# Constraint With Multiple Properties

---

Interface

```ts
interface Person {
  id: number;

  name: string;
}
```

---

Function

```ts
function display<T extends Person>(person: T) {
  console.log(person.id, person.name);
}
```

---

Valid

```ts
display({
  id: 1,
  name: "Prashant",
  age: 25,
});
```

---

Notice:

```ts
age;
```

is extra.

That is fine.

---

Constraint means:

```text
Required properties must exist.
Extra properties are allowed.
```

---

# Generic Constraints with Classes

---

Class

```ts
class Animal {
  name = "Animal";
}
```

---

Function

```ts
function printName<T extends Animal>(animal: T) {
  console.log(animal.name);
}
```

---

Child Class

```ts
class Dog extends Animal {}
```

---

Usage

```ts
printName(new Dog());
```

Output

```text
Animal
```

---

Because:

```ts
Dog;
```

satisfies:

```ts
Animal;
```

---

# Understanding `keyof`

One of the most important TypeScript concepts.

---

# What is `keyof`?

`keyof` extracts all property names from a type.

---

Example

```ts
type User = {
  id: number;

  name: string;

  age: number;
};
```

---

Using:

```ts
keyof User
```

produces:

```ts
"id" | "name" | "age";
```

---

Visualization

```text
User
 ├── id
 ├── name
 └── age
```

↓

```ts
"id" | "name" | "age";
```

---

# Why is `keyof` Useful?

Suppose we want:

```text
Safe Property Access
```

---

Without `keyof`

```ts
function getValue(obj: any, key: string) {
  return obj[key];
}
```

---

Problem

```ts
getValue(user, "salary");
```

Compiles.

---

But:

```text
salary does not exist
```

---

Runtime bug.

---

# Solution Using `keyof`

```ts
function getValue<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

---

Let's understand this carefully.

---

```ts
T;
```

represents:

```text
The Object Type
```

---

```ts
K;
```

represents:

```text
The Property Name
```

---

```ts
keyof T
```

represents:

```text
All keys inside T
```

---

Therefore:

```ts
K extends keyof T
```

means:

```text
K must be a valid key of T
```

---

# Example

---

Object

```ts
const user = {
  id: 1,

  name: "Prashant",

  age: 25,
};
```

---

Valid

```ts
getValue(user, "name");
```

Output

```text
Prashant
```

---

Valid

```ts
getValue(user, "age");
```

Output

```text
25
```

---

Invalid

```ts
getValue(user, "salary");
```

Error.

---

Because:

```text
salary
```

is not part of:

```ts
keyof User
```

---

# Why `keyof` Is So Important

Many built-in utility types use:

```ts
keyof;
```

internally.

Examples:

```ts
Pick;
Omit;
Record;
Partial;
Required;
```

---

Understanding:

```ts
keyof;
```

is essential before learning advanced TypeScript.

---

# Repository Example Using Constraints

Suppose we want a repository.

---

Without Constraints

```ts
class Repository<T> {
  private items: T[] = [];
}
```

---

Now imagine:

```ts
findById();
```

---

We need:

```ts
item.id;
```

---

But TypeScript doesn't know:

```text
id exists
```

---

# Solution

```ts
class Repository<T extends { id: number }> {
  private items: T[] = [];

  add(item: T) {
    this.items.push(item);
  }

  findById(id: number) {
    return this.items.find((item) => item.id === id);
  }
}
```

---

Now:

```text
TypeScript guarantees
id exists
```

---

Usage

```ts
const repo = new Repository<{
  id: number;
  name: string;
}>();
```

---

Valid.

---

# Default Generic Types

Sometimes we want:

```text
A default type
```

when the developer doesn't provide one.

---

Syntax

```ts
<T = DefaultType>
```

---

# Example

```ts
class ApiResponse<T = string> {
  data!: T;
}
```

---

Usage

```ts
const response = new ApiResponse();
```

---

Type becomes:

```ts
ApiResponse<string>;
```

automatically.

---

# Overriding Default Type

---

Default

```ts
const response = new ApiResponse();
```

Type:

```ts
ApiResponse<string>;
```

---

Custom

```ts
const response = new ApiResponse<number>();
```

Type:

```ts
ApiResponse<number>;
```

---

# Real World Example

API Wrapper

```ts
interface ApiResponse<T = unknown> {
  success: boolean;

  data: T;
}
```

---

Usage

```ts
const userResponse: ApiResponse<User>;
```

---

Usage

```ts
const productResponse: ApiResponse<Product>;
```

---

If no type provided:

```ts
ApiResponse;
```

↓

```ts
ApiResponse<unknown>;
```

---

Very common in production code.

---

# Combining Everything Together

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

Object

```ts
const user = {
  id: 1,

  name: "Prashant",
};
```

---

Usage

```ts
getProperty(user, "name");
```

---

Return Type

```ts
string;
```

Automatically inferred.

---

This is one of the most famous TypeScript Generic patterns.

---

# Common Mistakes

---

## Using Unconstrained Generics

Wrong

```ts
function fn<T>(value: T) {
  return value.length;
}
```

---

Use

```ts
<T extends HasLength>
```

---

## Confusing `extends` with Inheritance

In Generics:

```ts
<T extends User>
```

does NOT mean:

```text
Inheritance only
```

---

It means:

```text
Must satisfy User shape
```

---

## Not Using `keyof`

Wrong

```ts
key: string;
```

---

Better

```ts
K extends keyof T
```

---

Because:

```text
Compile-time safety
```

---

# Interview Questions

---

## Q1

What is a Generic Constraint?

### Answer

```text
A restriction placed
on a generic type.
```

---

## Q2

What does `extends` mean in Generics?

### Answer

```text
The generic type
must satisfy another type.
```

---

## Q3

What is `keyof`?

### Answer

```text
Extracts all property names
from a type.
```

---

## Q4

What does `K extends keyof T` mean?

### Answer

```text
K must be a valid key of T.
```

---

## Q5

Why use Default Generics?

### Answer

```text
To provide fallback types
when no generic is supplied.
```

---

# Cheat Sheet

```ts
<T extends Type>
```

---

```ts
interface HasLength {
  length: number;
}
```

---

```ts
keyof User
```

↓

```ts
"id" | "name" | "age";
```

---

```ts
K extends keyof T
```

---

```ts
T[K];
```

(Property Type Lookup)

---

```ts
<T = string>
```

(Default Generic)

---

# Key Takeaways

- Generic Constraints restrict generic types.
- `extends` is used to create constraints.
- Constraints improve type safety.
- `keyof` extracts property names from a type.
- `K extends keyof T` creates safe property access.
- Constraints are heavily used in utility types and libraries.
- Default Generics provide fallback types.
- Repository and API patterns frequently rely on constraints.
- `keyof` and constraints are foundational concepts for advanced TypeScript.
- Mastering these concepts makes utility types and advanced generics much easier to understand.

---
 


---\n*Last refined on April 14, 2026*


---\n*Last refined on April 19, 2026*


---\n*Last refined on April 27, 2026*
