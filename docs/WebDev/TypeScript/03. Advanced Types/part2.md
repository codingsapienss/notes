# Intersection Types

> In previour lession, we learned about Union Types (`|`), which allow a value to be one type OR another type.
>
> Intersection Types solve a different problem.
>
> Instead of:
>
> ```text
> Type A OR Type B
> ```
>
> they allow:
>
> ```text
> Type A AND Type B
> ```
>
> This is extremely useful when building:
>
> - User Models
> - API Responses
> - Database Entities
> - React Props
> - Shared Type Systems
>
> Intersection Types allow us to combine multiple types into a single type.

---

# What is an Intersection Type?

An Intersection Type combines multiple types into one.

---

## Syntax

```ts
TypeA & TypeB;
```

Read as:

```text
TypeA AND TypeB
```

---

# Mental Model

Suppose:

```ts
type Person = {
  name: string;
};
```

and

```ts
type Employee = {
  employeeId: number;
};
```

---

Intersection:

```ts
type Staff = Person & Employee;
```

---

Result:

```ts
{
  name: string;
  employeeId: number;
}
```

---

The new type contains:

```text
ALL properties
from BOTH types
```

---

# First Example

---

## Type 1

```ts
type Person = {
  name: string;
};
```

---

## Type 2

```ts
type Employee = {
  employeeId: number;
};
```

---

## Combined

```ts
type Staff = Person & Employee;
```

---

Result

```ts
{
  name: string;
  employeeId: number;
}
```

---

# Usage

```ts
const staff: Staff = {
  name: "Prashant",
  employeeId: 101,
};
```

Valid.

---

# Missing Property Example

```ts
const staff: Staff = {
  name: "Prashant",
};
```

Error.

---

Why?

Because:

```text
employeeId
```

is also required.

---

# Visualization

---

Person

```ts
{
  name: string;
}
```

---

Employee

```ts
{
  employeeId: number;
}
```

---

Intersection

```ts
{
  name: string;
  employeeId: number;
}
```

---

# Intersection with Multiple Types

Not limited to two types.

---

Example

```ts
type Person = {
  name: string;
};
```

---

```ts
type Employee = {
  employeeId: number;
};
```

---

```ts
type Admin = {
  permissions: string[];
};
```

---

Combined

```ts
type AdminStaff = Person & Employee & Admin;
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
const admin: AdminStaff = {
  name: "Prashant",
  employeeId: 101,
  permissions: ["read", "write"],
};
```

---

# Why Do We Need Intersections?

Without Intersections:

---

```ts
type AdminUser = {
  name: string;
  employeeId: number;
  permissions: string[];
};
```

---

Now imagine:

```text
50 Types
100 Models
```

Huge duplication.

---

Intersections allow:

```text
Composition
```

instead of repetition.

---

# Real World Example

Suppose every entity has:

```ts
type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};
```

---

User:

```ts
type User = {
  id: number;
  name: string;
};
```

---

Combine

```ts
type UserEntity = User & Timestamps;
```

---

Result

```ts
{
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

Very common in backend applications.

---

# Intersection vs Union

This is one of the most important concepts.

---

## Union

```ts
type A = {
  name: string;
};

type B = {
  age: number;
};

type Result = A | B;
```

---

Allowed

```ts
{
  name: "Prashant";
}
```

---

Allowed

```ts
{
  age: 25;
}
```

---

Allowed

```ts
{
  name: "Prashant",
  age: 25
}
```

---

Because:

```text
A OR B
```

---

# Intersection

```ts
type Result = A & B;
```

---

Required

```ts
{
  name: "Prashant",
  age: 25
}
```

---

Invalid

```ts
{
  name: "Prashant";
}
```

---

Invalid

```ts
{
  age: 25;
}
```

---

Because:

```text
A AND B
```

---

# Visual Comparison

---

Union

```ts
A | B;
```

Means:

```text
Either A
or B
or both
```

---

Intersection

```ts
A & B;
```

Means:

```text
Must satisfy A
and B
simultaneously
```

---

# Intersection with Primitive Types

Possible but rarely useful.

---

Example

```ts
type Result = string & number;
```

---

Question:

Can a value be:

```text
string AND number
```

at the same time?

No.

---

Result:

```ts
never;
```

---

Meaning:

```text
Impossible Type
```

---

# Example

```ts
type Value = string & number;
```

---

Trying:

```ts
let x: Value;
```

No valid value can exist.

---

# Property Conflict Example

---

Type 1

```ts
type A = {
  id: string;
};
```

---

Type 2

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

Becomes

```ts
{
  id: string & number;
}
```

---

Which becomes:

```ts
never;
```

---

Result:

```ts
{
  id: never;
}
```

---

Impossible to satisfy.

---

# Example

```ts
type A = {
  id: string;
};

type B = {
  id: number;
};

type Result = A & B;
```

---

Cannot create:

```ts
const value: Result = {
  id: ???
};
```

---

No value satisfies both.

---

# Compatible Property Example

---

Type A

```ts
type A = {
  id: number;
};
```

---

Type B

```ts
type B = {
  name: string;
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
  id: number;
  name: string;
}
```

Perfectly valid.

---

# Intersections with Type Aliases

Very common.

---

Example

```ts
type BaseUser = {
  id: number;
};
```

---

```ts
type Profile = {
  name: string;
};
```

---

```ts
type User = BaseUser & Profile;
```

---

Result

```ts
{
  id: number;
  name: string;
}
```

---

# API Response Example

---

Common Metadata

```ts
type ApiMeta = {
  timestamp: string;
};
```

---

Actual Data

```ts
type UserData = {
  id: number;
  name: string;
};
```

---

Response

```ts
type ApiResponse = ApiMeta & UserData;
```

---

Result

```ts
{
  timestamp: string;
  id: number;
  name: string;
}
```

---

# Why Intersections Are Powerful

They encourage:

```text
Composition
```

instead of:

```text
Duplication
```

---

Bad

```ts
type User = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};
```

---

```ts
type Product = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};
```

---

Repeated code.

---

Better

```ts
type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};
```

---

```ts
type User = BaseUser & Timestamps;
```

---

```ts
type Product = BaseProduct & Timestamps;
```

---

Cleaner.

---

# Common Mistakes

---

## Confusing Union and Intersection

Wrong Mental Model:

```text
&
means OR
```

No.

---

```text
&
means AND
```

---

## Conflicting Properties

Bad

```ts
type A = {
  id: string;
};

type B = {
  id: number;
};
```

---

Produces:

```ts
id: never;
```

---

## Overusing Huge Intersections

Bad

```ts
A & B & C & D & E & F;
```

---

Can become difficult to understand.

---

Keep types meaningful.

---

# Interview Questions

---

## Q1

What is an Intersection Type?

### Answer

```text
A type that combines multiple
types into one.
```

---

## Q2

What does `&` mean?

### Answer

```text
AND
```

between types.

---

## Q3

Difference between:

```ts
A | B;
```

and

```ts
A & B;
```

### Answer

```ts
A | B;
```

means:

```text
Either A or B
```

---

```ts
A & B;
```

means:

```text
Both A and B
```

---

## Q4

What happens when two intersected properties have incompatible types?

### Answer

They become:

```ts
never;
```

making the type impossible to satisfy.

---

## Q5

Why are Intersection Types useful?

### Answer

```text
They reduce duplication by
allowing type composition.
```

---

# Cheat Sheet

```ts
type Staff = Person & Employee;
```

---

```ts
type UserEntity = User & Timestamps;
```

---

```ts
type AdminUser = User & Employee & Admin;
```

---

```ts
type Result = string & number;
```

↓

```ts
never;
```

---

# Key Takeaways

- Intersection Types combine multiple types into one.
- The `&` operator means "AND".
- The resulting type must satisfy all intersected types.
- Intersections are commonly used for type composition.
- They help eliminate duplication.
- Union Types increase flexibility; Intersection Types increase requirements.
- Property conflicts can produce `never`.
- Intersections work extremely well with Type Aliases.
- They are heavily used in API models, database entities, and large applications.
- Understanding intersections is essential before learning Type Narrowing and Discriminated Unions.

---


---\n*Last refined on April 26, 2026*


---\n*Last refined on April 27, 2026*
